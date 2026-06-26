import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { StatusCodes } from 'http-status-codes';
import { AdminController } from '@/admin/admin.controller';
import { AdminService } from '@/admin/admin.service';
import { AuthModule } from '@/auth/auth.module';
import { AuthService } from '@/auth/auth.service';
import { RolesModule } from '@/auth/roles.module';
import { User, UserRole } from '@/user/user.entity';
import { TimeDuration } from '@/lib/time';
import { buildDecodedToken, setupAuth } from './auth';
import { dbConfig } from './database';

// Exercises the real RolesGuard + IdentityService against a real (sqlite) DB —
// only AuthService.verifyToken is stubbed. Proves the headline security contract:
// a non-admin token is rejected on an admin route.
describe('Admin route role enforcement (e2e)', () => {
  let app: INestApplication<App>;
  let authService: AuthService;
  let dataSource: DataSource;
  let validToken: string;

  beforeAll(async () => {
    const authSetup = await setupAuth();
    authService = authSetup.authService;
    validToken = authSetup.validToken;
  }, 30 * TimeDuration.Second);

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(dbConfig), AuthModule, RolesModule],
      controllers: [AdminController],
      providers: [AdminService],
    })
      .overrideProvider(AuthService)
      .useValue(authService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    dataSource = moduleFixture.get<DataSource>(getDataSourceToken());
    await dataSource.getRepository(User).save({
      id: 1,
      name: 'Test User',
      employee_id: '1',
      role: UserRole.User,
    });
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await app.close();
  });

  it('GET /admin/tables (non-admin) -> 403', async () => {
    jest
      .spyOn(authService, 'verifyToken')
      .mockResolvedValue(
        buildDecodedToken('1', 'user@profiq.com', 'firebase-user')
      );

    await request(app.getHttpServer())
      .get('/admin/tables')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(StatusCodes.FORBIDDEN);
  });

  it('GET /admin/tables (admin) -> 200', async () => {
    await dataSource.getRepository(User).update(1, { role: UserRole.Admin });
    jest
      .spyOn(authService, 'verifyToken')
      .mockResolvedValue(
        buildDecodedToken('1', 'admin@profiq.com', 'firebase-admin')
      );

    await request(app.getHttpServer())
      .get('/admin/tables')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(StatusCodes.OK);
  });
});
