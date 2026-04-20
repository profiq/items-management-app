import { Test, TestingModule } from '@nestjs/testing';
import request, { Response } from 'supertest';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatusCodes } from 'http-status-codes';
import { LocationsModule } from '@/locations/locations.module';
import { CitiesModule } from '@/cities/cities.module';
import { LocationsAdminController } from '@/admin/locations.admin.controller';
import { CitiesAdminController } from '@/admin/cities.admin.controller';
import { AuthGuard } from '@/auth/auth.guard';
import { RolesGuard } from '@/auth/roles.guard';
import { Location } from '@/locations/entities/location.entity';
import { dbConfig } from './database';

describe('LocationsModule (e2e)', (): void => {
  let app: INestApplication<App>;
  let cityId: number;

  beforeEach(async (): Promise<void> => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [LocationsModule, CitiesModule, TypeOrmModule.forRoot(dbConfig)],
      controllers: [LocationsAdminController, CitiesAdminController],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const cityRes: Response = await request(app.getHttpServer())
      .post('/admin/cities')
      .send({ name: 'Prague' });
    cityId = (cityRes.body as { id: number }).id;
  });

  afterEach(async (): Promise<void> => {
    await app.close();
  });

  describe('/admin/locations (POST)', (): void => {
    it('should create a location', async (): Promise<void> => {
      await request(app.getHttpServer())
        .post('/admin/locations')
        .send({ name: 'Central Library', city_id: cityId })
        .expect(StatusCodes.CREATED)
        .expect((res: Response) => {
          const body = res.body as Location;
          expect(body.id).toBeDefined();
          expect(body.name).toBe('Central Library');
          expect(body.city_id).toBe(cityId);
          expect(body.archived_at).toBeNull();
        });
    });
  });

  describe('/locations (GET)', (): void => {
    it('should return all locations', async (): Promise<void> => {
      await request(app.getHttpServer())
        .post('/admin/locations')
        .send({ name: 'Central Library', city_id: cityId });
      await request(app.getHttpServer())
        .post('/admin/locations')
        .send({ name: 'North Branch', city_id: cityId });

      await request(app.getHttpServer())
        .get('/locations')
        .expect(StatusCodes.OK)
        .expect((res: Response) => {
          const body = res.body as Location[];
          expect(Array.isArray(body)).toBe(true);
          expect(body).toHaveLength(2);
          expect(body[0].name).toBe('Central Library');
          expect(body[1].name).toBe('North Branch');
        });
    });

    it('should return empty array when no locations exist', async (): Promise<void> => {
      await request(app.getHttpServer())
        .get('/locations')
        .expect(StatusCodes.OK)
        .expect([]);
    });
  });

  describe('/locations/:id (GET)', (): void => {
    it('should return a location by id', async (): Promise<void> => {
      const created: Response = await request(app.getHttpServer())
        .post('/admin/locations')
        .send({ name: 'Central Library', city_id: cityId });

      const createdBody = created.body as Location;

      await request(app.getHttpServer())
        .get(`/locations/${createdBody.id}`)
        .expect(StatusCodes.OK)
        .expect((res: Response) => {
          const body = res.body as Location;
          expect(body.id).toBe(createdBody.id);
          expect(body.name).toBe('Central Library');
        });
    });

    it('should return 404 when location does not exist', async (): Promise<void> => {
      await request(app.getHttpServer())
        .get('/locations/9999')
        .expect(StatusCodes.NOT_FOUND);
    });
  });

  describe('/admin/locations/:id (PATCH)', (): void => {
    it('should update a location', async (): Promise<void> => {
      const created: Response = await request(app.getHttpServer())
        .post('/admin/locations')
        .send({ name: 'Central Library', city_id: cityId });

      const createdBody = created.body as Location;

      await request(app.getHttpServer())
        .patch(`/admin/locations/${createdBody.id}`)
        .send({ name: 'Updated Library' })
        .expect(StatusCodes.OK)
        .expect((res: Response) => {
          const body = res.body as Location;
          expect(body.name).toBe('Updated Library');
          expect(body.id).toBe(createdBody.id);
        });
    });

    it('should return 404 when location does not exist', async (): Promise<void> => {
      await request(app.getHttpServer())
        .patch('/admin/locations/9999')
        .send({ name: 'X' })
        .expect(StatusCodes.NOT_FOUND);
    });
  });

  describe('/admin/locations/:id (DELETE)', (): void => {
    it('should delete a location', async (): Promise<void> => {
      const created: Response = await request(app.getHttpServer())
        .post('/admin/locations')
        .send({ name: 'Central Library', city_id: cityId });

      const createdBody = created.body as Location;

      await request(app.getHttpServer())
        .delete(`/admin/locations/${createdBody.id}`)
        .expect(StatusCodes.OK);

      await request(app.getHttpServer())
        .get(`/locations/${createdBody.id}`)
        .expect(StatusCodes.NOT_FOUND);
    });

    it('should return 404 when location does not exist', async (): Promise<void> => {
      await request(app.getHttpServer())
        .delete('/admin/locations/9999')
        .expect(StatusCodes.NOT_FOUND);
    });
  });
});
