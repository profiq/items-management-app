import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { UserModule } from '@/user/user.module';
import { AuthService } from '@/auth/auth.service';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { User, UserRole } from '@/user/user.entity';
import { DataSource } from 'typeorm';
import { TimeDuration } from '@/lib/time';
import { buildDecodedToken, setupAuth } from './auth';
import { StatusCodes } from 'http-status-codes';
import { dbConfig } from './database';
import { HttpAdapterHost } from '@nestjs/core';
import { CustomExceptionsFilter } from '@/exception_filter/custom_exceptions.filter';

describe('UserModule', () => {
  let app: INestApplication<App>;
  let authService: AuthService;
  let dataSource: DataSource;
  let validToken: string;
  let invalidToken: string;

  function mockCurrentUser(
    googleWorkspaceUid: string,
    email: string,
    uid: string
  ) {
    jest
      .spyOn(authService, 'verifyToken')
      .mockResolvedValue(buildDecodedToken(googleWorkspaceUid, email, uid));
  }

  // Auth emulator is lazy loaded and not particularly fast at that,
  // so load AuthModule only once per test suite
  beforeAll(async () => {
    const authSetup = await setupAuth();
    authService = authSetup.authService;
    validToken = authSetup.validToken;
    invalidToken = authSetup.invalidToken;
  }, 30 * TimeDuration.Second);

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UserModule, TypeOrmModule.forRoot(dbConfig)],
    })
      .overrideProvider(AuthService)
      .useValue(authService)
      .compile();

    app = moduleFixture.createNestApplication();
    const httpAdapterHost = app.get(HttpAdapterHost);
    app.useGlobalFilters(new CustomExceptionsFilter(httpAdapterHost));
    await app.init();
    dataSource = moduleFixture.get<DataSource>(getDataSourceToken());
    const userRepository = dataSource.getRepository(User);
    const user = new User();
    user.id = 1;
    user.name = 'abcd abcd';
    user.employee_id = '1';
    //await userRepository.save(user);
    await dataSource.manager.save(user);
    await userRepository.insert([{ id: 2, name: 'Eve', employee_id: '2' }]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('/users (GET) (Admin)', async () => {
    await dataSource.getRepository(User).update(1, { role: UserRole.Admin });
    mockCurrentUser('1', 'admin@profiq.com', 'firebase-admin');

    return request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(StatusCodes.OK)
      .expect([
        {
          id: 1,
          name: 'abcd abcd',
          employee_id: '1',
          role: UserRole.Admin,
        },
        {
          id: 2,
          name: 'Eve',
          employee_id: '2',
          role: UserRole.User,
        },
      ]);
  });

  it('/users (GET) (Non-admin)', async () => {
    mockCurrentUser('1', 'user@profiq.com', 'firebase-user');

    await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(StatusCodes.FORBIDDEN);
  });

  it('/users (GET) (Wrong domain)', async () => {
    return request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${invalidToken}`)
      .expect(StatusCodes.FORBIDDEN);
  });
  it('/users (GET) (Invalid token)', () => {
    return request(app.getHttpServer())
      .get('/users')
      .set('Authorization', 'Bearer invalid-token')
      .expect(StatusCodes.FORBIDDEN);
  });
  it('/users (GET) (Missing Header)', () => {
    return request(app.getHttpServer())
      .get('/users')
      .expect(StatusCodes.FORBIDDEN);
  });
  it('/users/:id (GET) (Admin)', async () => {
    await dataSource.getRepository(User).update(1, { role: UserRole.Admin });
    mockCurrentUser('1', 'admin@profiq.com', 'firebase-admin');

    return request(app.getHttpServer())
      .get('/users/1')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(StatusCodes.OK)
      .expect({
        id: 1,
        name: 'abcd abcd',
        employee_id: '1',
        role: UserRole.Admin,
      });
  });

  it('/users/:id (GET) (Unauthenticated)', () => {
    return request(app.getHttpServer())
      .get('/users/1')
      .expect(StatusCodes.FORBIDDEN);
  });

  it('/users/:id (GET) (Non-admin)', async () => {
    mockCurrentUser('1', 'user@profiq.com', 'firebase-user');

    await request(app.getHttpServer())
      .get('/users/1')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(StatusCodes.FORBIDDEN);
  });

  it('/users/:id (GET) (Non-existant) (Admin)', async () => {
    await dataSource.getRepository(User).update(1, { role: UserRole.Admin });
    mockCurrentUser('1', 'admin@profiq.com', 'firebase-admin');

    return request(app.getHttpServer())
      .get('/users/3')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(StatusCodes.NOT_FOUND);
  });

  it('/users/:id (DELETE) (Non-admin)', async () => {
    mockCurrentUser('1', 'user@profiq.com', 'firebase-user');

    await request(app.getHttpServer())
      .delete('/users/2')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(StatusCodes.FORBIDDEN);

    await expect(
      dataSource.getRepository(User).findOneBy({ id: 2 })
    ).resolves.toMatchObject({
      id: 2,
      name: 'Eve',
      employee_id: '2',
      role: UserRole.User,
    });
  });

  it('/users (POST) (Unauthenticated)', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({ name: 'Mallory', workspace_id: '99' })
      .expect(StatusCodes.FORBIDDEN);
  });

  it('/users (POST) (Wrong domain)', () => {
    return request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${invalidToken}`)
      .send({ name: 'Mallory', workspace_id: '99' })
      .expect(StatusCodes.FORBIDDEN);
  });

  it('/users (POST) (Non-admin)', async () => {
    mockCurrentUser('1', 'user@profiq.com', 'firebase-user');

    await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ name: 'Mallory', workspace_id: '99' })
      .expect(StatusCodes.FORBIDDEN);

    await expect(
      dataSource.getRepository(User).findOneBy({ employee_id: '99' })
    ).resolves.toBeNull();
  });

  it('/users (POST) (Admin) passes role guard', async () => {
    await dataSource.getRepository(User).update(1, { role: UserRole.Admin });
    mockCurrentUser('1', 'admin@profiq.com', 'firebase-admin');

    const res = await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ name: 'Mallory', workspace_id: '99' });

    expect(res.status).not.toBe(StatusCodes.FORBIDDEN);
  });

  it('/users/:id (DELETE) (Admin)', async () => {
    await dataSource.getRepository(User).update(1, { role: UserRole.Admin });
    mockCurrentUser('1', 'admin@profiq.com', 'firebase-admin');

    await request(app.getHttpServer())
      .delete('/users/2')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(StatusCodes.OK);

    return request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(StatusCodes.OK)
      .expect([
        {
          id: 1,
          name: 'abcd abcd',
          employee_id: '1',
          role: UserRole.Admin,
        },
      ]);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });
});
