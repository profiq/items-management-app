import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { EmployeeModule } from '@/employee/employee.module';
import { EmployeeService } from '@/employee/employee.service';
import { IEmployee } from '@/employee/interfaces/employee.interface';
import { AuthService } from '@/auth/auth.service';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { TimeDuration } from '@/lib/time';
import { buildDecodedToken, setupAuth } from './auth';
import { StatusCodes } from 'http-status-codes';
import { dbConfig } from './database';
import { DataSource } from 'typeorm';
import { User, UserRole } from '@/user/user.entity';

describe('EmployeeModule', () => {
  let app: INestApplication<App>;
  let authService: AuthService;
  let dataSource: DataSource;
  let validToken: string;
  let invalidToken: string;

  const employeeService = {
    getEmployees: jest.fn(() => [
      {
        id: '1',
        name: 'abcd abcd',
        email: 'mail@example.com',
        photoUrl: 'http://example.com/img.png',
      } as IEmployee,
    ]),
    syncEmployeeNames: jest.fn(() => undefined),
  };

  beforeAll(async () => {
    const authSetup = await setupAuth();
    authService = authSetup.authService;
    validToken = authSetup.validToken;
    invalidToken = authSetup.invalidToken;
  }, 30 * TimeDuration.Second);

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [EmployeeModule, TypeOrmModule.forRoot(dbConfig)],
    })
      .overrideProvider(EmployeeService)
      .useValue(employeeService)
      .overrideProvider(AuthService)
      .useValue(authService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    dataSource = moduleFixture.get<DataSource>(getDataSourceToken());
    await dataSource.getRepository(User).save({
      id: 1,
      name: 'abcd abcd',
      employee_id: '1',
      role: UserRole.User,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    employeeService.getEmployees.mockClear();
    employeeService.syncEmployeeNames.mockClear();
  });

  it('/employees (GET)', async () => {
    return request(app.getHttpServer())
      .get('/employees')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(StatusCodes.OK)
      .expect([
        {
          id: '1',
          name: 'abcd abcd',
          email: 'mail@example.com',
          photoUrl: 'http://example.com/img.png',
        },
      ]);
  });
  it('/employees (GET) (Wrong domain)', async () => {
    return request(app.getHttpServer())
      .get('/employees')
      .set('Authorization', `Bearer ${invalidToken}`)
      .expect(StatusCodes.FORBIDDEN);
  });
  it('/employees (GET) (Invalid token)', () => {
    return request(app.getHttpServer())
      .get('/employees')
      .set('Authorization', 'Bearer invalid-token')
      .expect(StatusCodes.FORBIDDEN);
  });
  it('/employees (GET) (Missing Header)', () => {
    return request(app.getHttpServer())
      .get('/employees')
      .expect(StatusCodes.FORBIDDEN);
  });

  it('/employees/sync (POST) (Non-admin)', async () => {
    jest
      .spyOn(authService, 'verifyToken')
      .mockResolvedValue(
        buildDecodedToken('1', 'user@profiq.com', 'firebase-user')
      );

    await request(app.getHttpServer())
      .post('/employees/sync')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(StatusCodes.FORBIDDEN);

    expect(employeeService.syncEmployeeNames).not.toHaveBeenCalled();
  });

  it('/employees/sync (POST) (Admin)', async () => {
    await dataSource.getRepository(User).update(1, { role: UserRole.Admin });
    jest
      .spyOn(authService, 'verifyToken')
      .mockResolvedValue(
        buildDecodedToken('1', 'admin@profiq.com', 'firebase-admin')
      );

    await request(app.getHttpServer())
      .post('/employees/sync')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(StatusCodes.CREATED);

    expect(employeeService.syncEmployeeNames).toHaveBeenCalledTimes(1);
  });

  afterAll(async () => {
    await app.close();
  });
});
