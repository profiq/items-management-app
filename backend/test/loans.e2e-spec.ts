import { Test, TestingModule } from '@nestjs/testing';
import request, { Response } from 'supertest';
import { ExecutionContext, INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { StatusCodes } from 'http-status-codes';
import { LoansModule } from '@/loans/loans.module';
import { ItemCopiesModule } from '@/item-copies/item-copies.module';
import { ItemsModule } from '@/items/items.module';
import { LocationsModule } from '@/locations/locations.module';
import { CitiesModule } from '@/cities/cities.module';
import { ItemsAdminController } from '@/admin/items.admin.controller';
import { CitiesAdminController } from '@/admin/cities.admin.controller';
import { LocationsAdminController } from '@/admin/locations.admin.controller';
import { ItemCopiesAdminController } from '@/admin/item-copies.admin.controller';
import { AuthGuard } from '@/auth/auth.guard';
import { RolesGuard } from '@/auth/roles.guard';
import { Loan } from '@/loans/entities/loan.entity';
import { Item } from '@/items/entities/item.entity';
import { City } from '@/cities/entities/city.entity';
import { Location } from '@/locations/entities/location.entity';
import {
  ItemCopy,
  ItemCondition,
} from '@/item-copies/entities/item-copy.entity';
import { User, UserRole } from '@/user/user.entity';
import { AuthService } from '@/auth/auth.service';
import { TimeDuration } from '@/lib/time';
import { buildDecodedToken, setupAuth } from './auth';
import { dbConfig } from './database';

const mockFirebaseUser = buildDecodedToken(
  'emp1',
  'user@profiq.com',
  'firebase-user'
);

describe('LoansModule (e2e)', (): void => {
  let app: INestApplication<App>;
  let copyId: number;
  let userId: number;

  beforeEach(async (): Promise<void> => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        LoansModule,
        ItemCopiesModule,
        ItemsModule,
        LocationsModule,
        CitiesModule,
        TypeOrmModule.forRoot(dbConfig),
      ],
      controllers: [
        ItemsAdminController,
        CitiesAdminController,
        LocationsAdminController,
        ItemCopiesAdminController,
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context
            .switchToHttp()
            .getRequest<Record<string, unknown>>();
          req['firebaseUser'] = mockFirebaseUser;
          return true;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const dataSource = moduleFixture.get<DataSource>(getDataSourceToken());
    const user = new User();
    user.name = 'John Doe';
    user.employee_id = 'emp1';
    const savedUser = await dataSource.manager.save(user);
    userId = savedUser.id;

    const itemRes: Response = await request(app.getHttpServer())
      .post('/admin/items')
      .send({ name: 'Clean Code', default_loan_days: 14 });
    const itemId = (itemRes.body as { id: number }).id;

    const cityRes: Response = await request(app.getHttpServer())
      .post('/admin/cities')
      .send({ name: 'Prague' });
    const cityId = (cityRes.body as { id: number }).id;

    const locationRes: Response = await request(app.getHttpServer())
      .post('/admin/locations')
      .send({ name: 'Central Library', city_id: cityId });
    const locationId = (locationRes.body as { id: number }).id;

    const copyRes: Response = await request(app.getHttpServer())
      .post(`/admin/items/${itemId}/copies`)
      .send({ location_id: locationId, condition: 'good' });
    copyId = (copyRes.body as { id: number }).id;
  });

  afterEach(async (): Promise<void> => {
    await app.close();
  });

  describe('/loans (POST)', (): void => {
    it('should create a loan', async (): Promise<void> => {
      await request(app.getHttpServer())
        .post('/loans')
        .send({ copy_id: copyId, user_id: userId, due_date: '2026-05-01' })
        .expect(StatusCodes.CREATED)
        .expect((res: Response) => {
          const body = res.body as Loan;
          expect(body.id).toBeDefined();
          expect(body.copy_id).toBe(copyId);
          expect(body.user_id).toBe(userId);
          expect(body.due_date).toBe('2026-05-01');
          expect(body.borrowed_at).toBeDefined();
          expect(body.returned_at).toBeNull();
          expect(body.returned_by_user_id).toBeNull();
        });
    });

    it('should resolve concurrent creates for the same copy as one 201 and one 409', async (): Promise<void> => {
      const body = {
        copy_id: copyId,
        user_id: userId,
        due_date: '2026-05-01',
      };
      const responses: Response[] = await Promise.all([
        request(app.getHttpServer()).post('/loans').send(body),
        request(app.getHttpServer()).post('/loans').send(body),
      ]);
      const codes = responses
        .map((r: Response): number => r.status)
        .sort((a: number, b: number): number => a - b);
      expect(codes).toEqual([StatusCodes.CREATED, StatusCodes.CONFLICT]);
    });
  });

  describe('/loans (GET)', (): void => {
    it('should return all loans', async (): Promise<void> => {
      await request(app.getHttpServer())
        .post('/loans')
        .send({ copy_id: copyId, user_id: userId, due_date: '2026-05-01' });

      await request(app.getHttpServer())
        .get('/loans')
        .expect(StatusCodes.OK)
        .expect((res: Response) => {
          const body = res.body as Loan[];
          expect(Array.isArray(body)).toBe(true);
          expect(body).toHaveLength(1);
        });
    });

    it('should return empty array when no loans exist', async (): Promise<void> => {
      await request(app.getHttpServer())
        .get('/loans')
        .expect(StatusCodes.OK)
        .expect([]);
    });
  });

  describe('/loans/:id (GET)', (): void => {
    it('should return a loan by id', async (): Promise<void> => {
      const created: Response = await request(app.getHttpServer())
        .post('/loans')
        .send({ copy_id: copyId, user_id: userId, due_date: '2026-05-01' });

      const createdBody = created.body as Loan;

      await request(app.getHttpServer())
        .get(`/loans/${createdBody.id}`)
        .expect(StatusCodes.OK)
        .expect((res: Response) => {
          const body = res.body as Loan;
          expect(body.id).toBe(createdBody.id);
          expect(body.copy_id).toBe(copyId);
        });
    });

    it('should return 404 when loan does not exist', async (): Promise<void> => {
      await request(app.getHttpServer())
        .get('/loans/9999')
        .expect(StatusCodes.NOT_FOUND);
    });
  });

  describe('/loans/:id (PATCH)', (): void => {
    it('should mark loan as returned', async (): Promise<void> => {
      const created: Response = await request(app.getHttpServer())
        .post('/loans')
        .send({ copy_id: copyId, user_id: userId, due_date: '2026-05-01' });

      const createdBody = created.body as Loan;

      await request(app.getHttpServer())
        .patch(`/loans/${createdBody.id}`)
        .send({
          returned_at: '2026-04-10T12:00:00Z',
          returned_by_user_id: userId,
        })
        .expect(StatusCodes.OK)
        .expect((res: Response) => {
          const body = res.body as Loan;
          expect(body.returned_at).toBeDefined();
          expect(body.returned_by_user_id).toBe(userId);
        });
    });

    it('should return 404 when loan does not exist', async (): Promise<void> => {
      await request(app.getHttpServer())
        .patch('/loans/9999')
        .send({ returned_at: '2026-04-10T12:00:00Z' })
        .expect(StatusCodes.NOT_FOUND);
    });
  });

  describe('/loans/:id (DELETE)', (): void => {
    it('should delete a loan', async (): Promise<void> => {
      const created: Response = await request(app.getHttpServer())
        .post('/loans')
        .send({ copy_id: copyId, user_id: userId, due_date: '2026-05-01' });

      const createdBody = created.body as Loan;

      await request(app.getHttpServer())
        .delete(`/loans/${createdBody.id}`)
        .expect(StatusCodes.OK);

      await request(app.getHttpServer())
        .get(`/loans/${createdBody.id}`)
        .expect(StatusCodes.NOT_FOUND);
    });

    it('should return 404 when loan does not exist', async (): Promise<void> => {
      await request(app.getHttpServer())
        .delete('/loans/9999')
        .expect(StatusCodes.NOT_FOUND);
    });
  });
});

describe('LoansModule auth (e2e)', (): void => {
  let app: INestApplication<App>;
  let authService: AuthService;
  let validToken: string;
  let invalidToken: string;
  let dataSource: DataSource;
  let copyId: number;
  let userId: number;

  beforeAll(async (): Promise<void> => {
    const authSetup = await setupAuth();
    authService = authSetup.authService;
    validToken = authSetup.validToken;
    invalidToken = authSetup.invalidToken;
  }, 30 * TimeDuration.Second);

  beforeEach(async (): Promise<void> => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        LoansModule,
        ItemCopiesModule,
        ItemsModule,
        LocationsModule,
        CitiesModule,
        TypeOrmModule.forRoot(dbConfig),
      ],
    })
      .overrideProvider(AuthService)
      .useValue(authService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    dataSource = moduleFixture.get<DataSource>(getDataSourceToken());

    const user = new User();
    user.name = 'John Doe';
    user.employee_id = 'emp1';
    const savedUser = await dataSource.manager.save(user);
    userId = savedUser.id;

    const item = new Item();
    item.name = 'Clean Code';
    item.default_loan_days = 14;
    const savedItem = await dataSource.manager.save(item);

    const city = new City();
    city.name = 'Prague';
    const savedCity = await dataSource.manager.save(city);

    const location = new Location();
    location.name = 'Central Library';
    location.city_id = savedCity.id;
    const savedLocation = await dataSource.manager.save(location);

    const copy = new ItemCopy();
    copy.item_id = savedItem.id;
    copy.location_id = savedLocation.id;
    copy.condition = ItemCondition.Good;
    const savedCopy = await dataSource.manager.save(copy);
    copyId = savedCopy.id;
  });

  afterEach(async (): Promise<void> => {
    jest.restoreAllMocks();
    await app.close();
  });

  describe('unauthenticated access', (): void => {
    it('GET /loans returns 403 without token', async (): Promise<void> => {
      await request(app.getHttpServer())
        .get('/loans')
        .expect(StatusCodes.FORBIDDEN);
    });

    it('GET /loans/:id returns 403 without token', async (): Promise<void> => {
      await request(app.getHttpServer())
        .get('/loans/1')
        .expect(StatusCodes.FORBIDDEN);
    });

    it('POST /loans returns 403 without token', async (): Promise<void> => {
      await request(app.getHttpServer())
        .post('/loans')
        .send({ copy_id: copyId, user_id: userId, due_date: '2026-05-01' })
        .expect(StatusCodes.FORBIDDEN);
    });

    it('PATCH /loans/:id returns 403 without token', async (): Promise<void> => {
      await request(app.getHttpServer())
        .patch('/loans/1')
        .send({ returned_at: new Date().toISOString() })
        .expect(StatusCodes.FORBIDDEN);
    });

    it('DELETE /loans/:id returns 403 without token', async (): Promise<void> => {
      await request(app.getHttpServer())
        .delete('/loans/1')
        .expect(StatusCodes.FORBIDDEN);
    });
  });

  describe('wrong domain token', (): void => {
    it('GET /loans returns 403 for non-profiq.com token', async (): Promise<void> => {
      await request(app.getHttpServer())
        .get('/loans')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(StatusCodes.FORBIDDEN);
    });

    it('POST /loans returns 403 for non-profiq.com token', async (): Promise<void> => {
      await request(app.getHttpServer())
        .post('/loans')
        .set('Authorization', `Bearer ${invalidToken}`)
        .send({ copy_id: copyId, user_id: userId, due_date: '2026-05-01' })
        .expect(StatusCodes.FORBIDDEN);
    });

    it('PATCH /loans/:id returns 403 for non-profiq.com token', async (): Promise<void> => {
      const loan = new Loan();
      loan.copy_id = copyId;
      loan.user_id = userId;
      loan.borrowed_at = new Date();
      loan.due_date = '2026-05-01';
      loan.returned_at = null;
      loan.returned_by_user_id = null;
      const created = await dataSource.manager.save(loan);

      await request(app.getHttpServer())
        .patch(`/loans/${created.id}`)
        .set('Authorization', `Bearer ${invalidToken}`)
        .send({
          returned_at: new Date().toISOString(),
          returned_by_user_id: userId,
        })
        .expect(StatusCodes.FORBIDDEN);
    });

    it('DELETE /loans/:id returns 403 for non-profiq.com token', async (): Promise<void> => {
      const loan = new Loan();
      loan.copy_id = copyId;
      loan.user_id = userId;
      loan.borrowed_at = new Date();
      loan.due_date = '2026-05-01';
      loan.returned_at = null;
      loan.returned_by_user_id = null;
      const created = await dataSource.manager.save(loan);

      await request(app.getHttpServer())
        .delete(`/loans/${created.id}`)
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(StatusCodes.FORBIDDEN);
    });
  });

  describe('authenticated non-admin access', (): void => {
    beforeEach((): void => {
      jest
        .spyOn(authService, 'verifyToken')
        .mockResolvedValue(mockFirebaseUser);
    });

    it('GET /loans returns 200 for authenticated non-admin', async (): Promise<void> => {
      await request(app.getHttpServer())
        .get('/loans')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(StatusCodes.OK);
    });

    it('GET /loans/:id returns 404 for authenticated non-admin (loan does not exist)', async (): Promise<void> => {
      await request(app.getHttpServer())
        .get('/loans/9999')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(StatusCodes.NOT_FOUND);
    });

    it('POST /loans returns 403 for authenticated non-admin', async (): Promise<void> => {
      await request(app.getHttpServer())
        .post('/loans')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ copy_id: copyId, user_id: userId, due_date: '2026-05-01' })
        .expect(StatusCodes.FORBIDDEN);
    });

    it('PATCH /loans/:id returns 403 for authenticated non-admin', async (): Promise<void> => {
      await request(app.getHttpServer())
        .patch('/loans/1')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ returned_at: new Date().toISOString() })
        .expect(StatusCodes.FORBIDDEN);
    });

    it('DELETE /loans/:id returns 403 for authenticated non-admin', async (): Promise<void> => {
      await request(app.getHttpServer())
        .delete('/loans/1')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(StatusCodes.FORBIDDEN);
    });
  });

  describe('authenticated admin access', (): void => {
    beforeEach(async (): Promise<void> => {
      await dataSource
        .getRepository(User)
        .update(userId, { role: UserRole.Admin });
      jest
        .spyOn(authService, 'verifyToken')
        .mockResolvedValue(
          buildDecodedToken('emp1', 'admin@profiq.com', 'firebase-admin')
        );
    });

    it('POST /loans returns 201 for admin', async (): Promise<void> => {
      await request(app.getHttpServer())
        .post('/loans')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ copy_id: copyId, user_id: userId, due_date: '2026-05-01' })
        .expect(StatusCodes.CREATED);
    });

    it('PATCH /loans/:id returns 200 for admin', async (): Promise<void> => {
      const created: Response = await request(app.getHttpServer())
        .post('/loans')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ copy_id: copyId, user_id: userId, due_date: '2026-05-01' });
      const loanId = (created.body as { id: number }).id;

      await request(app.getHttpServer())
        .patch(`/loans/${loanId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          returned_at: new Date().toISOString(),
          returned_by_user_id: userId,
        })
        .expect(StatusCodes.OK);
    });

    it('DELETE /loans/:id returns 200 for admin', async (): Promise<void> => {
      const created: Response = await request(app.getHttpServer())
        .post('/loans')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ copy_id: copyId, user_id: userId, due_date: '2026-05-01' });
      const loanId = (created.body as { id: number }).id;

      await request(app.getHttpServer())
        .delete(`/loans/${loanId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .expect(StatusCodes.OK);
    });
  });
});
