import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { EmployeeModule } from '@/employee/employee.module';
import { EmployeeService } from '@/employee/employee.service';
import { IEmployee } from '@/employee/interfaces/employee.interface';
import { AuthService } from '@/auth/auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeDuration } from '@/lib/time';
import { setupAuth } from './auth';
import { StatusCodes } from 'http-status-codes';

describe('EmployeeModule', () => {
  let app: INestApplication<App>;
  let authService: AuthService;
  let validToken: string;
  let invalidToken: string;

  const employeeService = {
    getEmployees: async () => [
      {
        id: '1',
        name: 'abcd abcd',
        email: 'mail@example.com',
        photoUrl: 'http://example.com/img.png',
      } as IEmployee,
    ],
  };

  beforeAll(async () => {
    const authSetup = await setupAuth();
    authService = authSetup.authService;
    validToken = authSetup.validToken;
    invalidToken = authSetup.invalidToken;
  }, 30 * TimeDuration.Second);

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        EmployeeModule,
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          autoLoadEntities: true,
          synchronize: true,
          dropSchema: true,
        }),
      ],
    })
      .overrideProvider(EmployeeService)
      .useValue(employeeService)
      .overrideProvider(AuthService)
      .useValue(authService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
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

  afterAll(async () => {
    await app.close();
  });
});
