import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { EmployeeModule } from '@/employee/employee.module';
import { EmployeeService } from '@/employee/employee.service';
import { Employee } from '@/employee/interfaces/employee.interface';
import { AuthService } from '@/auth/auth.service';
import { DecodedIdToken } from 'firebase-admin/auth';
import { TypeOrmModule } from '@nestjs/typeorm';

describe('EmployeeModule', () => {
  let app: INestApplication<App>;

  const employeeService = {
    getEmployees: async () => [
      {
        id: '1',
        name: 'abcd abcd',
        email: 'mail@example.com',
        photoUrl: 'http://example.com/img.png',
      } as Employee,
    ],
  };

  const authService = {
    verifyToken: async (token: string): Promise<DecodedIdToken> => {
      if (token == 'valid-token') {
        return { email: 'valid@profiq.com' } as DecodedIdToken;
      }
      if (token == 'wrong-domain') {
        return { email: 'invalid@example.com' } as DecodedIdToken;
      }
      return { email: undefined } as DecodedIdToken;
    },
  };

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

  it('/employees (GET)', () => {
    return request(app.getHttpServer())
      .get('/employees')
      .set('Authorization', 'Bearer valid-token')
      .expect(200)
      .expect([
        {
          id: '1',
          name: 'abcd abcd',
          email: 'mail@example.com',
          photoUrl: 'http://example.com/img.png',
        },
      ]);
  });
  it('/employees (GET) (Wrong domain)', () => {
    return request(app.getHttpServer())
      .get('/employees')
      .set('Authorization', 'Bearer wrong-domain')
      .expect(403);
  });
  it('/employees (GET) (Invalid token)', () => {
    return request(app.getHttpServer())
      .get('/employees')
      .set('Authorization', 'Bearer invalid-token')
      .expect(403);
  });
  it('/employees (GET) (Missing Header)', () => {
    return request(app.getHttpServer()).get('/employees').expect(403);
  });

  afterAll(async () => {
    await app.close();
  });
});
