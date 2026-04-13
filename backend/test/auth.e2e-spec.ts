import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { AuthModule } from '@/auth/auth.module';
import { AuthService } from '@/auth/auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, UserRole } from '@/user/user.entity';
import { UserService } from '@/user/user.service';
import { TimeDuration } from '@/lib/time';
import { setupAuth } from './auth';
import { StatusCodes } from 'http-status-codes';
import { dbConfig } from './database';
import { HttpAdapterHost } from '@nestjs/core';
import { CustomExceptionsFilter } from '@/exception_filter/custom_exceptions.filter';

const mockUser: User = {
  id: 1,
  name: 'Test User',
  employee_id: 'google-workspace-uid',
  role: UserRole.User,
};

describe('AuthModule', () => {
  let app: INestApplication<App>;
  let authService: AuthService;
  let validToken: string;
  let invalidToken: string;

  beforeAll(async () => {
    const authSetup = await setupAuth();
    authService = authSetup.authService;
    validToken = authSetup.validToken;
    invalidToken = authSetup.invalidToken;
  }, 30 * TimeDuration.Second);

  const buildApp = async (user: User | null) => {
    const mockUserService: jest.Mocked<
      Pick<
        UserService,
        'upsertByGoogleWorkspaceToken' | 'getUserByGoogleWorkspaceUid'
      >
    > = {
      upsertByGoogleWorkspaceToken: jest.fn().mockResolvedValue(user),
      getUserByGoogleWorkspaceUid: jest.fn().mockResolvedValue(user),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule, TypeOrmModule.forRoot(dbConfig)],
    })
      .overrideProvider(AuthService)
      .useValue(authService)
      .overrideProvider(UserService)
      .useValue(mockUserService)
      .compile();

    const app = moduleFixture.createNestApplication();
    const httpAdapterHost = app.get(HttpAdapterHost);
    app.useGlobalFilters(new CustomExceptionsFilter(httpAdapterHost));
    await app.init();
    return app;
  };

  afterEach(async () => {
    await app.close();
  });

  describe('POST /auth/login', () => {
    it('returns user profile with role', async () => {
      app = await buildApp(mockUser);
      return request(app.getHttpServer())
        .post('/auth/login')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(StatusCodes.OK)
        .expect({
          id: 1,
          name: 'Test User',
          employee_id: 'google-workspace-uid',
          role: UserRole.User,
        });
    });

    it('returns 404 when user not in DB', async () => {
      app = await buildApp(null);
      return request(app.getHttpServer())
        .post('/auth/login')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(StatusCodes.NOT_FOUND);
    });

    it('returns 403 for wrong domain token', async () => {
      app = await buildApp(mockUser);
      return request(app.getHttpServer())
        .post('/auth/login')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(StatusCodes.FORBIDDEN);
    });

    it('returns 403 without token', async () => {
      app = await buildApp(mockUser);
      return request(app.getHttpServer())
        .post('/auth/login')
        .expect(StatusCodes.FORBIDDEN);
    });
  });

  describe('GET /auth/me', () => {
    it('returns current user profile with role', async () => {
      app = await buildApp(mockUser);
      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(StatusCodes.OK)
        .expect({
          id: 1,
          name: 'Test User',
          employee_id: 'google-workspace-uid',
          role: UserRole.User,
        });
    });

    it('returns 404 when user not in DB', async () => {
      app = await buildApp(null);
      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(StatusCodes.NOT_FOUND);
    });

    it('returns 403 for wrong domain token', async () => {
      app = await buildApp(mockUser);
      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(StatusCodes.FORBIDDEN);
    });

    it('returns 403 without token', async () => {
      app = await buildApp(mockUser);
      return request(app.getHttpServer())
        .get('/auth/me')
        .expect(StatusCodes.FORBIDDEN);
    });
  });

  describe('POST /auth/logout', () => {
    it('returns 200', async () => {
      app = await buildApp(mockUser);
      return request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(StatusCodes.OK);
    });

    it('returns 403 without token', async () => {
      app = await buildApp(mockUser);
      return request(app.getHttpServer())
        .post('/auth/logout')
        .expect(StatusCodes.FORBIDDEN);
    });
  });
});
