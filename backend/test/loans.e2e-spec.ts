import { Test, TestingModule } from '@nestjs/testing';
import request, { Response } from 'supertest';
import {
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { App } from 'supertest/types';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { DecodedIdToken } from 'firebase-admin/auth';
import { DataSource } from 'typeorm';
import { StatusCodes } from 'http-status-codes';
import { LoansModule } from '@/loans/loans.module';
import { ItemCopiesModule } from '@/item-copies/item-copies.module';
import { ItemsModule } from '@/items/items.module';
import { LocationsModule } from '@/locations/locations.module';
import { CitiesModule } from '@/cities/cities.module';
import { UserModule } from '@/user/user.module';
import { ItemsAdminController } from '@/admin/items.admin.controller';
import { CitiesAdminController } from '@/admin/cities.admin.controller';
import { LocationsAdminController } from '@/admin/locations.admin.controller';
import { ItemCopiesAdminController } from '@/admin/item-copies.admin.controller';
import { LoansAdminController } from '@/admin/loans.admin.controller';
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
import { FirebaseService } from '@/firebase/firebase.service';
import { buildDecodedToken } from './auth';
import { dbConfig } from './database';

// The employee_id in this token must match the user seeded in beforeEach
const MOCK_FIREBASE_USER = buildDecodedToken(
  'emp1',
  'test@profiq.com',
  'test-uid'
);

type FirebaseRequest = { firebaseUser: DecodedIdToken };

async function buildApp(): Promise<{
  app: INestApplication<App>;
  ds: DataSource;
}> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      LoansModule,
      ItemCopiesModule,
      ItemsModule,
      LocationsModule,
      CitiesModule,
      UserModule,
      TypeOrmModule.forRoot(dbConfig),
    ],
    controllers: [
      ItemsAdminController,
      CitiesAdminController,
      LocationsAdminController,
      ItemCopiesAdminController,
      LoansAdminController,
    ],
  })
    // Prevent Firebase Admin SDK initialization in unit-style happy-path suite
    .overrideProvider(FirebaseService)
    .useValue({})
    .overrideProvider(AuthService)
    .useValue({ verifyToken: jest.fn() })
    .overrideGuard(AuthGuard)
    .useValue({
      canActivate: (ctx: ExecutionContext) => {
        const req = ctx.switchToHttp().getRequest<FirebaseRequest>();
        req.firebaseUser = MOCK_FIREBASE_USER;
        return true;
      },
    })
    .overrideGuard(RolesGuard)
    .useValue({ canActivate: () => true })
    .compile();

  const app =
    moduleFixture.createNestApplication() as unknown as INestApplication<App>;
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  await app.init();
  const ds = moduleFixture.get<DataSource>(getDataSourceToken());
  return { app, ds };
}

async function seedCopyWithItem(
  app: INestApplication<App>,
  defaultLoanDays = 14
): Promise<{ copyId: number; itemId: number }> {
  const itemRes: Response = await request(app.getHttpServer())
    .post('/admin/items')
    .send({ name: 'Clean Code', default_loan_days: defaultLoanDays });
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
  const copyId = (copyRes.body as { id: number }).id;

  return { copyId, itemId };
}

function expectDateTimeString(value: unknown): void {
  expect(value).toEqual(expect.any(String));
  expect(Number.isNaN(Date.parse(value as string))).toBe(false);
}

// ─── happy path ───────────────────────────────────────────────────────────────

describe('LoansModule (e2e)', (): void => {
  let app: INestApplication<App>;
  let ds: DataSource;
  let copyId: number;
  let userId: number;

  beforeEach(async (): Promise<void> => {
    ({ app, ds } = await buildApp());

    const user = new User();
    user.name = 'Alice';
    user.employee_id = 'emp1';
    const savedUser = await ds.manager.save(user);
    userId = savedUser.id;

    ({ copyId } = await seedCopyWithItem(app));
  });

  afterEach(async (): Promise<void> => {
    await app.close();
  });

  describe('POST /loans', (): void => {
    it('creates a loan with auto-calculated due_date', async (): Promise<void> => {
      await request(app.getHttpServer())
        .post('/loans')
        .send({ copyId })
        .expect(StatusCodes.CREATED)
        .expect((res: Response) => {
          const body = res.body as Loan;
          expect(body.id).toBeDefined();
          expect(body.copy_id).toBe(copyId);
          expect(body.user_id).toBe(userId);
          expect(body.due_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
          expect(body.borrowed_at).toBeDefined();
          expect(body.returned_at).toBeNull();
        });
    });

    it('returns 422 when borrowing an archived copy', async (): Promise<void> => {
      await ds.manager.update(ItemCopy, copyId, { archived_at: new Date() });
      await request(app.getHttpServer())
        .post('/loans')
        .send({ copyId })
        .expect(StatusCodes.UNPROCESSABLE_ENTITY);
    });

    it('returns 409 when copy is already on loan', async (): Promise<void> => {
      await request(app.getHttpServer())
        .post('/loans')
        .send({ copyId })
        .expect(StatusCodes.CREATED);

      await request(app.getHttpServer())
        .post('/loans')
        .send({ copyId })
        .expect(StatusCodes.CONFLICT);
    });

    it('allows borrowing the same copy after it is returned', async (): Promise<void> => {
      const firstLoanRes: Response = await request(app.getHttpServer())
        .post('/loans')
        .send({ copyId })
        .expect(StatusCodes.CREATED);
      const firstLoanId = (firstLoanRes.body as Loan).id;

      await request(app.getHttpServer())
        .put(`/loans/${firstLoanId}/return`)
        .expect(StatusCodes.OK);

      await request(app.getHttpServer())
        .post('/loans')
        .send({ copyId })
        .expect(StatusCodes.CREATED)
        .expect((res: Response) => {
          const body = res.body as Loan;
          expect(body.id).not.toBe(firstLoanId);
          expect(body.copy_id).toBe(copyId);
          expect(body.returned_at).toBeNull();
        });
    });

    it('returns 404 when copy does not exist', async (): Promise<void> => {
      await request(app.getHttpServer())
        .post('/loans')
        .send({ copyId: 9999 })
        .expect(StatusCodes.NOT_FOUND);
    });
  });

  describe('GET /loans/my', (): void => {
    it('returns loans for the current user', async (): Promise<void> => {
      await request(app.getHttpServer()).post('/loans').send({ copyId });

      await request(app.getHttpServer())
        .get('/loans/my')
        .expect(StatusCodes.OK)
        .expect((res: Response) => {
          const body = res.body as Loan[];
          expect(Array.isArray(body)).toBe(true);
          expect(body).toHaveLength(1);
          expect(body[0].user_id).toBe(userId);
        });
    });

    it('returns empty array when user has no loans', async (): Promise<void> => {
      await request(app.getHttpServer())
        .get('/loans/my')
        .expect(StatusCodes.OK)
        .expect([]);
    });
  });

  describe('PUT /loans/:id/return', (): void => {
    it('returns the loan when caller is the borrower', async (): Promise<void> => {
      const createRes: Response = await request(app.getHttpServer())
        .post('/loans')
        .send({ copyId });
      const loanId = (createRes.body as { id: number }).id;

      await request(app.getHttpServer())
        .put(`/loans/${loanId}/return`)
        .expect(StatusCodes.OK)
        .expect((res: Response) => {
          const body = res.body as Loan;
          expectDateTimeString(body.returned_at);
          expect(body.returned_by_user_id).toBe(userId);
        });
    });

    it('returns 409 when loan is already returned', async (): Promise<void> => {
      const createRes: Response = await request(app.getHttpServer())
        .post('/loans')
        .send({ copyId });
      const loanId = (createRes.body as { id: number }).id;

      await request(app.getHttpServer()).put(`/loans/${loanId}/return`);
      await request(app.getHttpServer())
        .put(`/loans/${loanId}/return`)
        .expect(StatusCodes.CONFLICT);
    });

    it('returns 404 when loan does not exist', async (): Promise<void> => {
      await request(app.getHttpServer())
        .put('/loans/9999/return')
        .expect(StatusCodes.NOT_FOUND);
    });

    it('returns 403 when caller is not the borrower', async (): Promise<void> => {
      const createRes: Response = await request(app.getHttpServer())
        .post('/loans')
        .send({ copyId });
      const loanId = (createRes.body as { id: number }).id;

      const otherUser = new User();
      otherUser.name = 'Bob';
      otherUser.employee_id = 'emp2';
      const savedOther = await ds.manager.save(otherUser);

      await ds.manager.update(Loan, loanId, { user_id: savedOther.id });

      await request(app.getHttpServer())
        .put(`/loans/${loanId}/return`)
        .expect(StatusCodes.FORBIDDEN);
    });
  });

  describe('GET /admin/loans', (): void => {
    it('returns all loans without filter', async (): Promise<void> => {
      await request(app.getHttpServer()).post('/loans').send({ copyId });

      await request(app.getHttpServer())
        .get('/admin/loans')
        .expect(StatusCodes.OK)
        .expect((res: Response) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect((res.body as Loan[]).length).toBeGreaterThanOrEqual(1);
        });
    });

    it('filters active loans', async (): Promise<void> => {
      await request(app.getHttpServer()).post('/loans').send({ copyId });

      await request(app.getHttpServer())
        .get('/admin/loans?status=active')
        .expect(StatusCodes.OK)
        .expect((res: Response) => {
          const body = res.body as Loan[];
          expect(body.length).toBeGreaterThanOrEqual(1);
          body.forEach(loan => expect(loan.returned_at).toBeNull());
        });
    });

    it('filters returned loans', async (): Promise<void> => {
      const createRes: Response = await request(app.getHttpServer())
        .post('/loans')
        .send({ copyId });
      const loanId = (createRes.body as { id: number }).id;

      await request(app.getHttpServer()).put(`/loans/${loanId}/return`);

      await request(app.getHttpServer())
        .get('/admin/loans?status=returned')
        .expect(StatusCodes.OK)
        .expect((res: Response) => {
          const body = res.body as Loan[];
          expect(body.length).toBeGreaterThanOrEqual(1);
          body.forEach(loan => expectDateTimeString(loan.returned_at));
        });
    });

    it('filters overdue loans', async (): Promise<void> => {
      const createRes: Response = await request(app.getHttpServer())
        .post('/loans')
        .send({ copyId });
      const created = createRes.body as Loan;
      const yesterday = new Date();
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);
      const overdueDueDate = yesterday.toISOString().split('T')[0];
      await ds.manager.update(Loan, created.id, { due_date: overdueDueDate });

      await request(app.getHttpServer())
        .get('/admin/loans?status=overdue')
        .expect(StatusCodes.OK)
        .expect((res: Response) => {
          const body = res.body as Loan[];
          expect(body.map(loan => loan.id)).toContain(created.id);
          body.forEach(loan => {
            expect(loan.returned_at).toBeNull();
            expect(loan.due_date < new Date().toISOString().split('T')[0]).toBe(
              true
            );
          });
        });
    });
  });

  describe('PUT /admin/loans/:id/return', (): void => {
    it('returns loan on behalf of user', async (): Promise<void> => {
      const createRes: Response = await request(app.getHttpServer())
        .post('/loans')
        .send({ copyId });
      const loanId = (createRes.body as { id: number }).id;

      const borrower = new User();
      borrower.name = 'Borrower';
      borrower.employee_id = 'emp-borrower';
      const savedBorrower = await ds.manager.save(borrower);
      await ds.manager.update(Loan, loanId, { user_id: savedBorrower.id });

      await request(app.getHttpServer())
        .put(`/admin/loans/${loanId}/return`)
        .expect(StatusCodes.OK)
        .expect((res: Response) => {
          const body = res.body as Loan;
          expect(body.user_id).toBe(savedBorrower.id);
          expectDateTimeString(body.returned_at);
          expect(body.returned_by_user_id).toBe(userId);
        });
    });

    it('returns 404 when loan does not exist', async (): Promise<void> => {
      await request(app.getHttpServer())
        .put('/admin/loans/9999/return')
        .expect(StatusCodes.NOT_FOUND);
    });
  });

  describe('PUT /admin/loans/:id/extend', (): void => {
    it('extends due_date by given days', async (): Promise<void> => {
      const createRes: Response = await request(app.getHttpServer())
        .post('/loans')
        .send({ copyId });
      const created = createRes.body as Loan;

      await request(app.getHttpServer())
        .put(`/admin/loans/${created.id}/extend`)
        .send({ dueDays: 7 })
        .expect(StatusCodes.OK)
        .expect((res: Response) => {
          const body = res.body as Loan;
          const originalDue = new Date(created.due_date + 'T00:00:00Z');
          const extendedDue = new Date(body.due_date + 'T00:00:00Z');
          const diffDays = Math.round(
            (extendedDue.getTime() - originalDue.getTime()) / 86_400_000
          );
          expect(diffDays).toBe(7);
        });
    });

    it('returns 404 when loan does not exist', async (): Promise<void> => {
      await request(app.getHttpServer())
        .put('/admin/loans/9999/extend')
        .send({ dueDays: 7 })
        .expect(StatusCodes.NOT_FOUND);
    });
  });
});

// ─── auth ─────────────────────────────────────────────────────────────────────

describe('LoansModule auth (e2e)', (): void => {
  let app: INestApplication<App>;
  let authService: AuthService;
  const validToken = 'valid-test-token';
  let ds: DataSource;
  let copyId: number;
  let userId: number;

  beforeAll((): void => {
    authService = {
      verifyToken: jest.fn((idToken?: string) => {
        if (idToken === validToken) {
          return buildDecodedToken('emp1', 'test@profiq.com', 'firebase-user');
        }
        return { email: undefined };
      }),
    } as unknown as AuthService;
  });

  beforeEach(async (): Promise<void> => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        LoansModule,
        ItemCopiesModule,
        ItemsModule,
        LocationsModule,
        CitiesModule,
        UserModule,
        TypeOrmModule.forRoot(dbConfig),
      ],
      controllers: [LoansAdminController],
      providers: [
        { provide: AuthService, useValue: authService },
        AuthGuard,
        RolesGuard,
      ],
    })
      .overrideProvider(FirebaseService)
      .useValue({})
      .overrideProvider(AuthService)
      .useValue(authService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
    ds = moduleFixture.get<DataSource>(getDataSourceToken());

    const user = new User();
    user.name = 'Alice';
    user.employee_id = 'emp1';
    const savedUser = await ds.manager.save(user);
    userId = savedUser.id;

    const item = new Item();
    item.name = 'Clean Code';
    item.default_loan_days = 14;
    const savedItem = await ds.manager.save(item);

    const city = new City();
    city.name = 'Prague';
    const savedCity = await ds.manager.save(city);

    const location = new Location();
    location.name = 'Central Library';
    location.city_id = savedCity.id;
    const savedLocation = await ds.manager.save(location);

    const copy = new ItemCopy();
    copy.item_id = savedItem.id;
    copy.location_id = savedLocation.id;
    copy.condition = ItemCondition.Good;
    const savedCopy = await ds.manager.save(copy);
    copyId = savedCopy.id;
  });

  afterEach(async (): Promise<void> => {
    jest.restoreAllMocks();
    if (app && typeof app.close === 'function') {
      await app.close();
    }
  });

  describe('unauthenticated access', (): void => {
    it('GET /loans/my returns 403 without token', async (): Promise<void> => {
      await request(app.getHttpServer())
        .get('/loans/my')
        .expect(StatusCodes.FORBIDDEN);
    });

    it('POST /loans returns 403 without token', async (): Promise<void> => {
      await request(app.getHttpServer())
        .post('/loans')
        .send({ copyId })
        .expect(StatusCodes.FORBIDDEN);
    });

    it('PUT /loans/:id/return returns 403 without token', async (): Promise<void> => {
      await request(app.getHttpServer())
        .put('/loans/1/return')
        .expect(StatusCodes.FORBIDDEN);
    });

    it('GET /admin/loans returns 403 without token', async (): Promise<void> => {
      await request(app.getHttpServer())
        .get('/admin/loans')
        .expect(StatusCodes.FORBIDDEN);
    });

    it('PUT /admin/loans/:id/return returns 403 without token', async (): Promise<void> => {
      await request(app.getHttpServer())
        .put('/admin/loans/1/return')
        .expect(StatusCodes.FORBIDDEN);
    });

    it('PUT /admin/loans/:id/extend returns 403 without token', async (): Promise<void> => {
      await request(app.getHttpServer())
        .put('/admin/loans/1/extend')
        .send({ dueDays: 7 })
        .expect(StatusCodes.FORBIDDEN);
    });
  });

  describe('authenticated non-admin access', (): void => {
    it('GET /loans/my returns 200', async (): Promise<void> => {
      await request(app.getHttpServer())
        .get('/loans/my')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(StatusCodes.OK);
    });

    it('POST /loans returns 201 for authenticated non-admin', async (): Promise<void> => {
      await request(app.getHttpServer())
        .post('/loans')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ copyId })
        .expect(StatusCodes.CREATED);
    });

    it('GET /admin/loans returns 403 for non-admin', async (): Promise<void> => {
      await request(app.getHttpServer())
        .get('/admin/loans')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(StatusCodes.FORBIDDEN);
    });
  });

  describe('authenticated admin access', (): void => {
    beforeEach(async (): Promise<void> => {
      await ds.getRepository(User).update(userId, { role: UserRole.Admin });
      jest
        .spyOn(authService, 'verifyToken')
        .mockResolvedValue(
          buildDecodedToken('emp1', 'admin@profiq.com', 'firebase-admin')
        );
    });

    it('GET /admin/loans returns 200 for admin', async (): Promise<void> => {
      await request(app.getHttpServer())
        .get('/admin/loans')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(StatusCodes.OK);
    });

    it('POST /loans returns 201 for admin', async (): Promise<void> => {
      await request(app.getHttpServer())
        .post('/loans')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ copyId })
        .expect(StatusCodes.CREATED);
    });
  });
});
