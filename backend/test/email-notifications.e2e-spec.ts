import { Test, TestingModule } from '@nestjs/testing';
import request, { Response } from 'supertest';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { StatusCodes } from 'http-status-codes';
import { AuthService } from '@/auth/auth.service';
import { TimeDuration } from '@/lib/time';
import { EmailNotificationsModule } from '@/email-notifications/email-notifications.module';
import { EmailNotification } from '@/email-notifications/entities/email-notification.entity';
import { User, UserRole } from '@/user/user.entity';
import { City } from '@/cities/entities/city.entity';
import { Location } from '@/locations/entities/location.entity';
import { Item } from '@/items/entities/item.entity';
import {
  ItemCondition,
  ItemCopy,
} from '@/item-copies/entities/item-copy.entity';
import { Loan } from '@/loans/entities/loan.entity';
import { dbConfig } from './database';
import { buildDecodedToken, setupAuth } from './auth';

describe('EmailNotificationsModule (e2e)', (): void => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let authService: AuthService;
  let validToken: string;
  let invalidToken: string;
  let readerLoanId: number;
  let otherLoanId: number;

  beforeAll(async (): Promise<void> => {
    const authSetup = await setupAuth();
    authService = authSetup.authService;
    validToken = authSetup.validToken;
    invalidToken = authSetup.invalidToken;
  }, 30 * TimeDuration.Second);

  beforeEach(async (): Promise<void> => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [EmailNotificationsModule, TypeOrmModule.forRoot(dbConfig)],
    })
      .overrideProvider(AuthService)
      .useValue(authService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get<DataSource>(getDataSourceToken());

    const adminUser = await dataSource.getRepository(User).save({
      name: 'Admin User',
      employee_id: 'admin-employee',
      role: UserRole.Admin,
    });

    const readerUser = await dataSource.getRepository(User).save({
      name: 'Reader User',
      employee_id: 'reader-employee',
      role: UserRole.User,
    });

    const otherUser = await dataSource.getRepository(User).save({
      name: 'Other User',
      employee_id: 'other-employee',
      role: UserRole.User,
    });

    const city = await dataSource.getRepository(City).save({
      name: 'Prague',
      archived_at: null,
    });

    const location = await dataSource.getRepository(Location).save({
      name: 'Central Library',
      city_id: city.id,
      archived_at: null,
    });

    const readerItem = await dataSource.getRepository(Item).save({
      name: 'Clean Code',
      description: null,
      image_url: null,
      default_loan_days: 14,
      archived_at: null,
      categories: [],
      tags: [],
    });

    const otherItem = await dataSource.getRepository(Item).save({
      name: 'Refactoring',
      description: null,
      image_url: null,
      default_loan_days: 14,
      archived_at: null,
      categories: [],
      tags: [],
    });

    const readerCopy = await dataSource.getRepository(ItemCopy).save({
      item_id: readerItem.id,
      location_id: location.id,
      condition: ItemCondition.Good,
      archived_at: null,
    });

    const otherCopy = await dataSource.getRepository(ItemCopy).save({
      item_id: otherItem.id,
      location_id: location.id,
      condition: ItemCondition.Good,
      archived_at: null,
    });

    const readerLoan = await dataSource.getRepository(Loan).save({
      copy_id: readerCopy.id,
      user_id: readerUser.id,
      borrowed_at: new Date('2026-04-01T10:00:00Z'),
      due_date: '2026-05-01',
      returned_at: null,
      returned_by_user_id: null,
    });
    readerLoanId = readerLoan.id;

    const otherLoan = await dataSource.getRepository(Loan).save({
      copy_id: otherCopy.id,
      user_id: otherUser.id,
      borrowed_at: new Date('2026-04-02T10:00:00Z'),
      due_date: '2026-05-02',
      returned_at: null,
      returned_by_user_id: null,
    });
    otherLoanId = otherLoan.id;

    expect(adminUser.role).toBe(UserRole.Admin);
  });

  afterEach(async (): Promise<void> => {
    jest.restoreAllMocks();
    await app.close();
  });

  const adminAuthHeader = (): string => {
    jest
      .spyOn(authService, 'verifyToken')
      .mockResolvedValue(
        buildDecodedToken(
          'admin-employee',
          'admin@profiq.com',
          'firebase-admin'
        )
      );
    return `Bearer ${validToken}`;
  };

  const readerAuthHeader = (): string => {
    jest
      .spyOn(authService, 'verifyToken')
      .mockResolvedValue(
        buildDecodedToken(
          'reader-employee',
          'reader@profiq.com',
          'firebase-user'
        )
      );
    return `Bearer ${validToken}`;
  };

  async function seedNotification(
    loanId: number,
    type: string
  ): Promise<EmailNotification> {
    return dataSource.getRepository(EmailNotification).save({
      loan_id: loanId,
      type,
      sent_at: new Date('2026-04-10T12:00:00Z'),
    });
  }

  describe('authentication', (): void => {
    it('should reject unauthenticated reads', async (): Promise<void> => {
      await request(app.getHttpServer())
        .get('/email-notifications')
        .expect(StatusCodes.FORBIDDEN);
    });

    it('should reject unauthenticated writes', async (): Promise<void> => {
      await request(app.getHttpServer())
        .post('/email-notifications')
        .send({ loan_id: readerLoanId, type: 'due_soon' })
        .expect(StatusCodes.FORBIDDEN);
    });

    it('should reject wrong-domain reads', async (): Promise<void> => {
      await request(app.getHttpServer())
        .get('/email-notifications')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(StatusCodes.FORBIDDEN);
    });

    it('should reject wrong-domain writes', async (): Promise<void> => {
      await request(app.getHttpServer())
        .post('/email-notifications')
        .set('Authorization', `Bearer ${invalidToken}`)
        .send({ loan_id: readerLoanId, type: 'due_soon' })
        .expect(StatusCodes.FORBIDDEN);
    });
  });

  describe('/email-notifications (POST)', (): void => {
    it('should reject non-admin users', async (): Promise<void> => {
      await request(app.getHttpServer())
        .post('/email-notifications')
        .set('Authorization', readerAuthHeader())
        .send({ loan_id: readerLoanId, type: 'due_soon' })
        .expect(StatusCodes.FORBIDDEN);
    });

    it('should create a notification for admins', async (): Promise<void> => {
      await request(app.getHttpServer())
        .post('/email-notifications')
        .set('Authorization', adminAuthHeader())
        .send({ loan_id: readerLoanId, type: 'due_soon' })
        .expect(StatusCodes.CREATED)
        .expect((res: Response) => {
          const body = res.body as EmailNotification;
          expect(body.id).toBeDefined();
          expect(body.loan_id).toBe(readerLoanId);
          expect(body.type).toBe('due_soon');
          expect(body.sent_at).toBeDefined();
        });
    });
  });

  describe('/email-notifications (GET)', (): void => {
    it('should return all notifications for admins', async (): Promise<void> => {
      await seedNotification(readerLoanId, 'due_soon');
      await seedNotification(otherLoanId, 'overdue');

      await request(app.getHttpServer())
        .get('/email-notifications')
        .set('Authorization', adminAuthHeader())
        .expect(StatusCodes.OK)
        .expect((res: Response) => {
          const body = res.body as EmailNotification[];
          expect(body).toHaveLength(2);
          expect(body.map(notification => notification.loan_id)).toEqual([
            readerLoanId,
            otherLoanId,
          ]);
        });
    });

    it('should return only notifications owned by the current user', async (): Promise<void> => {
      await seedNotification(readerLoanId, 'due_soon');
      await seedNotification(otherLoanId, 'overdue');

      await request(app.getHttpServer())
        .get('/email-notifications')
        .set('Authorization', readerAuthHeader())
        .expect(StatusCodes.OK)
        .expect((res: Response) => {
          const body = res.body as EmailNotification[];
          expect(body).toHaveLength(1);
          expect(body[0].loan_id).toBe(readerLoanId);
          expect(body[0].type).toBe('due_soon');
        });
    });
  });

  describe('/email-notifications/:id (GET)', (): void => {
    it('should return the current user notification', async (): Promise<void> => {
      const notification = await seedNotification(readerLoanId, 'due_soon');

      await request(app.getHttpServer())
        .get(`/email-notifications/${notification.id}`)
        .set('Authorization', readerAuthHeader())
        .expect(StatusCodes.OK)
        .expect((res: Response) => {
          const body = res.body as EmailNotification;
          expect(body.id).toBe(notification.id);
          expect(body.loan_id).toBe(readerLoanId);
        });
    });

    it('should hide notifications that belong to another user', async (): Promise<void> => {
      const notification = await seedNotification(otherLoanId, 'overdue');

      await request(app.getHttpServer())
        .get(`/email-notifications/${notification.id}`)
        .set('Authorization', readerAuthHeader())
        .expect(StatusCodes.NOT_FOUND);
    });
  });

  describe('/email-notifications/:id (DELETE)', (): void => {
    it('should reject non-admin users', async (): Promise<void> => {
      const notification = await seedNotification(readerLoanId, 'due_soon');

      await request(app.getHttpServer())
        .delete(`/email-notifications/${notification.id}`)
        .set('Authorization', readerAuthHeader())
        .expect(StatusCodes.FORBIDDEN);
    });

    it('should delete a notification for admins', async (): Promise<void> => {
      const notification = await seedNotification(otherLoanId, 'overdue');

      await request(app.getHttpServer())
        .delete(`/email-notifications/${notification.id}`)
        .set('Authorization', adminAuthHeader())
        .expect(StatusCodes.OK);

      await request(app.getHttpServer())
        .get(`/email-notifications/${notification.id}`)
        .set('Authorization', adminAuthHeader())
        .expect(StatusCodes.NOT_FOUND);
    });
  });
});
