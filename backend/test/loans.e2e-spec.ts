import { Test, TestingModule } from '@nestjs/testing';
import request, { Response } from 'supertest';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { StatusCodes } from 'http-status-codes';
import { LoansModule } from '@/loans/loans.module';
import { ItemCopiesModule } from '@/item-copies/item-copies.module';
import { ItemsModule } from '@/items/items.module';
import { LocationsModule } from '@/locations/locations.module';
import { CitiesModule } from '@/cities/cities.module';
import { Loan } from '@/loans/entities/loan.entity';
import { User } from '@/user/user.entity';
import { dbConfig } from './database';

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
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const dataSource = moduleFixture.get<DataSource>(getDataSourceToken());
    const user = new User();
    user.name = 'John Doe';
    user.employee_id = 'emp1';
    const savedUser = await dataSource.manager.save(user);
    userId = savedUser.id;

    const itemRes: Response = await request(app.getHttpServer())
      .post('/items')
      .send({ name: 'Clean Code', default_loan_days: 14 });
    const itemId = (itemRes.body as { id: number }).id;

    const cityRes: Response = await request(app.getHttpServer())
      .post('/cities')
      .send({ name: 'Prague' });
    const cityId = (cityRes.body as { id: number }).id;

    const locationRes: Response = await request(app.getHttpServer())
      .post('/locations')
      .send({ name: 'Central Library', city_id: cityId });
    const locationId = (locationRes.body as { id: number }).id;

    const copyRes: Response = await request(app.getHttpServer())
      .post('/item-copies')
      .send({ item_id: itemId, location_id: locationId, condition: 'good' });
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
