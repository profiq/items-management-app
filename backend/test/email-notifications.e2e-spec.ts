import { Test, TestingModule } from '@nestjs/testing';
import request, { Response } from 'supertest';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { StatusCodes } from 'http-status-codes';
import { EmailNotificationsModule } from '@/email-notifications/email-notifications.module';
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
import { EmailNotification } from '@/email-notifications/entities/email-notification.entity';
import { User } from '@/user/user.entity';
import { dbConfig } from './database';

describe('EmailNotificationsModule (e2e)', (): void => {
  let app: INestApplication<App>;
  let loanId: number;

  beforeEach(async (): Promise<void> => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        EmailNotificationsModule,
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
      .useValue({ canActivate: () => true })
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
      .post('/admin/item-copies')
      .send({ item_id: itemId, location_id: locationId, condition: 'good' });
    const copyId = (copyRes.body as { id: number }).id;

    const loanRes: Response = await request(app.getHttpServer())
      .post('/loans')
      .send({ copy_id: copyId, user_id: savedUser.id, due_date: '2026-05-01' });
    loanId = (loanRes.body as { id: number }).id;
  });

  afterEach(async (): Promise<void> => {
    await app.close();
  });

  describe('/email-notifications (POST)', (): void => {
    it('should create a notification', async (): Promise<void> => {
      await request(app.getHttpServer())
        .post('/email-notifications')
        .send({ loan_id: loanId, type: 'due_soon' })
        .expect(StatusCodes.CREATED)
        .expect((res: Response) => {
          const body = res.body as EmailNotification;
          expect(body.id).toBeDefined();
          expect(body.loan_id).toBe(loanId);
          expect(body.type).toBe('due_soon');
          expect(body.sent_at).toBeDefined();
        });
    });
  });

  describe('/email-notifications (GET)', (): void => {
    it('should return all notifications', async (): Promise<void> => {
      await request(app.getHttpServer())
        .post('/email-notifications')
        .send({ loan_id: loanId, type: 'due_soon' });
      await request(app.getHttpServer())
        .post('/email-notifications')
        .send({ loan_id: loanId, type: 'overdue' });

      await request(app.getHttpServer())
        .get('/email-notifications')
        .expect(StatusCodes.OK)
        .expect((res: Response) => {
          const body = res.body as EmailNotification[];
          expect(Array.isArray(body)).toBe(true);
          expect(body).toHaveLength(2);
          expect(body[0].type).toBe('due_soon');
          expect(body[1].type).toBe('overdue');
        });
    });

    it('should return empty array when no notifications exist', async (): Promise<void> => {
      await request(app.getHttpServer())
        .get('/email-notifications')
        .expect(StatusCodes.OK)
        .expect([]);
    });
  });

  describe('/email-notifications/:id (GET)', (): void => {
    it('should return a notification by id', async (): Promise<void> => {
      const created: Response = await request(app.getHttpServer())
        .post('/email-notifications')
        .send({ loan_id: loanId, type: 'due_soon' });

      const createdBody = created.body as EmailNotification;

      await request(app.getHttpServer())
        .get(`/email-notifications/${createdBody.id}`)
        .expect(StatusCodes.OK)
        .expect((res: Response) => {
          const body = res.body as EmailNotification;
          expect(body.id).toBe(createdBody.id);
          expect(body.type).toBe('due_soon');
        });
    });

    it('should return 404 when notification does not exist', async (): Promise<void> => {
      await request(app.getHttpServer())
        .get('/email-notifications/9999')
        .expect(StatusCodes.NOT_FOUND);
    });
  });

  describe('/email-notifications/:id (DELETE)', (): void => {
    it('should delete a notification', async (): Promise<void> => {
      const created: Response = await request(app.getHttpServer())
        .post('/email-notifications')
        .send({ loan_id: loanId, type: 'due_soon' });

      const createdBody = created.body as EmailNotification;

      await request(app.getHttpServer())
        .delete(`/email-notifications/${createdBody.id}`)
        .expect(StatusCodes.OK);

      await request(app.getHttpServer())
        .get(`/email-notifications/${createdBody.id}`)
        .expect(StatusCodes.NOT_FOUND);
    });

    it('should return 404 when notification does not exist', async (): Promise<void> => {
      await request(app.getHttpServer())
        .delete('/email-notifications/9999')
        .expect(StatusCodes.NOT_FOUND);
    });
  });
});
