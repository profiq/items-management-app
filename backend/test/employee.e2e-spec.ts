import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { EmployeeModule } from '../src/employee/employee.module';
import { EmployeeService } from '../src/employee/employee.service';
import { Employee } from '../src/employee/interfaces/employee.interface';

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

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [EmployeeModule],
    })
      .overrideProvider(EmployeeService)
      .useValue(employeeService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  // This is for later when tests make actual sense and for the sake of consistency
  it('/employees (GET)', () => {
    return request(app.getHttpServer())
      .get('/employees')
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

  afterAll(async () => {
    await app.close();
  });
});
