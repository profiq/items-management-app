import { Test, TestingModule } from '@nestjs/testing';
import request, { Response } from 'supertest';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatusCodes } from 'http-status-codes';
import { ItemCopiesModule } from '@/item-copies/item-copies.module';
import { ItemsModule } from '@/items/items.module';
import { LocationsModule } from '@/locations/locations.module';
import { CitiesModule } from '@/cities/cities.module';
import { ItemCopy } from '@/item-copies/entities/item-copy.entity';
import { dbConfig } from './database';

describe('ItemCopiesModule (e2e)', (): void => {
  let app: INestApplication<App>;
  let itemId: number;
  let locationId: number;

  beforeEach(async (): Promise<void> => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ItemCopiesModule,
        ItemsModule,
        LocationsModule,
        CitiesModule,
        TypeOrmModule.forRoot(dbConfig),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const itemRes: Response = await request(app.getHttpServer())
      .post('/items')
      .send({ name: 'Clean Code', default_loan_days: 14 });
    itemId = (itemRes.body as { id: number }).id;

    const cityRes: Response = await request(app.getHttpServer())
      .post('/cities')
      .send({ name: 'Prague' });
    const cityId = (cityRes.body as { id: number }).id;

    const locationRes: Response = await request(app.getHttpServer())
      .post('/locations')
      .send({ name: 'Central Library', city_id: cityId });
    locationId = (locationRes.body as { id: number }).id;
  });

  afterEach(async (): Promise<void> => {
    await app.close();
  });

  describe('/item-copies (POST)', (): void => {
    it('should create an item copy', async (): Promise<void> => {
      await request(app.getHttpServer())
        .post('/item-copies')
        .send({ item_id: itemId, location_id: locationId, condition: 'good' })
        .expect(StatusCodes.CREATED)
        .expect((res: Response) => {
          const body = res.body as ItemCopy;
          expect(body.id).toBeDefined();
          expect(body.item_id).toBe(itemId);
          expect(body.location_id).toBe(locationId);
          expect(body.condition).toBe('good');
          expect(body.archived_at).toBeNull();
        });
    });

    it('should create an item copy without condition', async (): Promise<void> => {
      await request(app.getHttpServer())
        .post('/item-copies')
        .send({ item_id: itemId, location_id: locationId })
        .expect(StatusCodes.CREATED)
        .expect((res: Response) => {
          const body = res.body as ItemCopy;
          expect(body.condition).toBeNull();
        });
    });
  });

  describe('/item-copies (GET)', (): void => {
    it('should return all item copies', async (): Promise<void> => {
      await request(app.getHttpServer())
        .post('/item-copies')
        .send({ item_id: itemId, location_id: locationId, condition: 'good' });
      await request(app.getHttpServer())
        .post('/item-copies')
        .send({
          item_id: itemId,
          location_id: locationId,
          condition: 'damaged',
        });

      await request(app.getHttpServer())
        .get('/item-copies')
        .expect(StatusCodes.OK)
        .expect((res: Response) => {
          const body = res.body as ItemCopy[];
          expect(Array.isArray(body)).toBe(true);
          expect(body).toHaveLength(2);
        });
    });

    it('should return empty array when no item copies exist', async (): Promise<void> => {
      await request(app.getHttpServer())
        .get('/item-copies')
        .expect(StatusCodes.OK)
        .expect([]);
    });
  });

  describe('/item-copies/:id (GET)', (): void => {
    it('should return an item copy by id', async (): Promise<void> => {
      const created: Response = await request(app.getHttpServer())
        .post('/item-copies')
        .send({ item_id: itemId, location_id: locationId, condition: 'good' });

      const createdBody = created.body as ItemCopy;

      await request(app.getHttpServer())
        .get(`/item-copies/${createdBody.id}`)
        .expect(StatusCodes.OK)
        .expect((res: Response) => {
          const body = res.body as ItemCopy;
          expect(body.id).toBe(createdBody.id);
          expect(body.condition).toBe('good');
        });
    });

    it('should return 404 when item copy does not exist', async (): Promise<void> => {
      await request(app.getHttpServer())
        .get('/item-copies/9999')
        .expect(StatusCodes.NOT_FOUND);
    });
  });

  describe('/item-copies/:id (PATCH)', (): void => {
    it('should update an item copy', async (): Promise<void> => {
      const created: Response = await request(app.getHttpServer())
        .post('/item-copies')
        .send({ item_id: itemId, location_id: locationId, condition: 'good' });

      const createdBody = created.body as ItemCopy;

      await request(app.getHttpServer())
        .patch(`/item-copies/${createdBody.id}`)
        .send({ condition: 'damaged' })
        .expect(StatusCodes.OK)
        .expect((res: Response) => {
          const body = res.body as ItemCopy;
          expect(body.condition).toBe('damaged');
          expect(body.id).toBe(createdBody.id);
        });
    });

    it('should return 404 when item copy does not exist', async (): Promise<void> => {
      await request(app.getHttpServer())
        .patch('/item-copies/9999')
        .send({ condition: 'damaged' })
        .expect(StatusCodes.NOT_FOUND);
    });
  });

  describe('/item-copies/:id (DELETE)', (): void => {
    it('should delete an item copy', async (): Promise<void> => {
      const created: Response = await request(app.getHttpServer())
        .post('/item-copies')
        .send({ item_id: itemId, location_id: locationId, condition: 'good' });

      const createdBody = created.body as ItemCopy;

      await request(app.getHttpServer())
        .delete(`/item-copies/${createdBody.id}`)
        .expect(StatusCodes.OK);

      await request(app.getHttpServer())
        .get(`/item-copies/${createdBody.id}`)
        .expect(StatusCodes.NOT_FOUND);
    });

    it('should return 404 when item copy does not exist', async (): Promise<void> => {
      await request(app.getHttpServer())
        .delete('/item-copies/9999')
        .expect(StatusCodes.NOT_FOUND);
    });
  });
});
