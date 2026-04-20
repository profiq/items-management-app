import { Test, TestingModule } from '@nestjs/testing';
import request, { Response } from 'supertest';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatusCodes } from 'http-status-codes';
import { CitiesModule } from '@/cities/cities.module';
import { CitiesAdminController } from '@/admin/cities.admin.controller';
import { AuthGuard } from '@/auth/auth.guard';
import { RolesGuard } from '@/auth/roles.guard';
import { City } from '@/cities/entities/city.entity';
import { dbConfig } from './database';

describe('CitiesModule (e2e)', (): void => {
  let app: INestApplication<App>;

  beforeEach(async (): Promise<void> => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CitiesModule, TypeOrmModule.forRoot(dbConfig)],
      controllers: [CitiesAdminController],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async (): Promise<void> => {
    await app.close();
  });

  describe('/admin/cities (POST)', (): void => {
    it('should create a city', async (): Promise<void> => {
      await request(app.getHttpServer())
        .post('/admin/cities')
        .send({ name: 'Prague' })
        .expect(StatusCodes.CREATED)
        .expect((res: Response) => {
          const body = res.body as City;
          expect(body.id).toBeDefined();
          expect(body.name).toBe('Prague');
          expect(body.archived_at).toBeNull();
        });
    });
  });

  describe('/cities (GET)', (): void => {
    it('should return all cities', async (): Promise<void> => {
      await request(app.getHttpServer())
        .post('/admin/cities')
        .send({ name: 'Prague' });
      await request(app.getHttpServer())
        .post('/admin/cities')
        .send({ name: 'Brno' });

      await request(app.getHttpServer())
        .get('/cities')
        .expect(StatusCodes.OK)
        .expect((res: Response) => {
          const body = res.body as City[];
          expect(Array.isArray(body)).toBe(true);
          expect(body).toHaveLength(2);
          expect(body[0].name).toBe('Prague');
          expect(body[1].name).toBe('Brno');
        });
    });

    it('should return empty array when no cities exist', async (): Promise<void> => {
      await request(app.getHttpServer())
        .get('/cities')
        .expect(StatusCodes.OK)
        .expect((res: Response) => {
          expect(res.body).toEqual([]);
        });
    });
  });

  describe('/cities/:id (GET)', (): void => {
    it('should return a city by id', async (): Promise<void> => {
      const created: Response = await request(app.getHttpServer())
        .post('/admin/cities')
        .send({ name: 'Prague' });

      const createdBody = created.body as City;

      await request(app.getHttpServer())
        .get(`/cities/${createdBody.id}`)
        .expect(StatusCodes.OK)
        .expect((res: Response) => {
          const body = res.body as City;
          expect(body.id).toBe(createdBody.id);
          expect(body.name).toBe('Prague');
        });
    });

    it('should return 404 when city does not exist', async (): Promise<void> => {
      await request(app.getHttpServer())
        .get('/cities/9999')
        .expect(StatusCodes.NOT_FOUND);
    });
  });

  describe('/admin/cities/:id (GET)', (): void => {
    it('should return 400 for non-numeric id', async (): Promise<void> => {
      await request(app.getHttpServer())
        .get('/admin/cities/not-a-number')
        .expect(StatusCodes.BAD_REQUEST);
    });
  });

  describe('/admin/cities/:id (PATCH)', (): void => {
    it('should update a city', async (): Promise<void> => {
      const created: Response = await request(app.getHttpServer())
        .post('/admin/cities')
        .send({ name: 'Prague' });

      const createdBody = created.body as City;

      await request(app.getHttpServer())
        .patch(`/admin/cities/${createdBody.id}`)
        .send({ name: 'Updated Prague' })
        .expect(StatusCodes.OK)
        .expect((res: Response) => {
          const body = res.body as City;
          expect(body.name).toBe('Updated Prague');
          expect(body.id).toBe(createdBody.id);
        });
    });

    it('should return 404 when city does not exist', async (): Promise<void> => {
      await request(app.getHttpServer())
        .patch('/admin/cities/9999')
        .send({ name: 'X' })
        .expect(StatusCodes.NOT_FOUND);
    });

    it('should return 400 for non-numeric id', async (): Promise<void> => {
      await request(app.getHttpServer())
        .patch('/admin/cities/not-a-number')
        .send({ name: 'X' })
        .expect(StatusCodes.BAD_REQUEST);
    });
  });

  describe('/admin/cities/:id (DELETE)', (): void => {
    it('should delete a city', async (): Promise<void> => {
      const created: Response = await request(app.getHttpServer())
        .post('/admin/cities')
        .send({ name: 'Prague' });

      const createdBody = created.body as City;

      await request(app.getHttpServer())
        .delete(`/admin/cities/${createdBody.id}`)
        .expect(StatusCodes.OK);

      await request(app.getHttpServer())
        .get(`/cities/${createdBody.id}`)
        .expect(StatusCodes.NOT_FOUND);
    });

    it('should return 404 when city does not exist', async (): Promise<void> => {
      await request(app.getHttpServer())
        .delete('/admin/cities/9999')
        .expect(StatusCodes.NOT_FOUND);
    });

    it('should return 400 for non-numeric id', async (): Promise<void> => {
      await request(app.getHttpServer())
        .delete('/admin/cities/not-a-number')
        .expect(StatusCodes.BAD_REQUEST);
    });
  });
});
