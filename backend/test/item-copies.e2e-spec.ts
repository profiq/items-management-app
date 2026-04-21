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
import { CategoriesModule } from '@/categories/categories.module';
import { TagsModule } from '@/tags/tags.module';
import { ItemCopiesAdminController } from '@/admin/item-copies.admin.controller';
import { ItemsAdminController } from '@/admin/items.admin.controller';
import { LocationsAdminController } from '@/admin/locations.admin.controller';
import { CitiesAdminController } from '@/admin/cities.admin.controller';
import { AuthGuard } from '@/auth/auth.guard';
import { RolesGuard } from '@/auth/roles.guard';
import {
  ItemCopy,
  ItemCondition,
} from '@/item-copies/entities/item-copy.entity';
import { Item } from '@/items/entities/item.entity';
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
        CategoriesModule,
        TagsModule,
        TypeOrmModule.forRoot(dbConfig),
      ],
      controllers: [
        ItemCopiesAdminController,
        ItemsAdminController,
        LocationsAdminController,
        CitiesAdminController,
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const itemRes: Response = await request(app.getHttpServer())
      .post('/admin/items')
      .send({ name: 'Clean Code', default_loan_days: 14 });
    itemId = (itemRes.body as { id: number }).id;

    const cityRes: Response = await request(app.getHttpServer())
      .post('/admin/cities')
      .send({ name: 'Prague' });
    const cityId = (cityRes.body as { id: number }).id;

    const locationRes: Response = await request(app.getHttpServer())
      .post('/admin/locations')
      .send({ name: 'Central Library', city_id: cityId });
    locationId = (locationRes.body as { id: number }).id;
  });

  afterEach(async (): Promise<void> => {
    await app.close();
  });

  describe('/admin/items/:itemId/copies (POST)', (): void => {
    it('should create an item copy', async (): Promise<void> => {
      await request(app.getHttpServer())
        .post(`/admin/items/${itemId}/copies`)
        .send({ location_id: locationId, condition: ItemCondition.Good })
        .expect(StatusCodes.CREATED)
        .expect((res: Response) => {
          const body = res.body as ItemCopy;
          expect(body.id).toBeDefined();
          expect(body.item_id).toBe(itemId);
          expect(body.location_id).toBe(locationId);
          expect(body.condition).toBe(ItemCondition.Good);
          expect(body.archived_at).toBeNull();
        });
    });

    it('should create an item copy without condition', async (): Promise<void> => {
      await request(app.getHttpServer())
        .post(`/admin/items/${itemId}/copies`)
        .send({ location_id: locationId })
        .expect(StatusCodes.CREATED)
        .expect((res: Response) => {
          const body = res.body as ItemCopy;
          expect(body.condition).toBeNull();
        });
    });
  });

  describe('/admin/items/:itemId/copies/:copyId (PUT)', (): void => {
    it('should update an item copy', async (): Promise<void> => {
      const created: Response = await request(app.getHttpServer())
        .post(`/admin/items/${itemId}/copies`)
        .send({ location_id: locationId, condition: ItemCondition.Good });

      const createdBody = created.body as ItemCopy;

      await request(app.getHttpServer())
        .put(`/admin/items/${itemId}/copies/${createdBody.id}`)
        .send({ condition: ItemCondition.Damaged })
        .expect(StatusCodes.OK)
        .expect((res: Response) => {
          const body = res.body as ItemCopy;
          expect(body.condition).toBe(ItemCondition.Damaged);
          expect(body.id).toBe(createdBody.id);
        });
    });

    it('should return 404 when item copy does not exist', async (): Promise<void> => {
      await request(app.getHttpServer())
        .put(`/admin/items/${itemId}/copies/9999`)
        .send({ condition: ItemCondition.Damaged })
        .expect(StatusCodes.NOT_FOUND);
    });
  });

  describe('/admin/items/:itemId/copies/:copyId (DELETE)', (): void => {
    it('should soft delete (archive) an item copy', async (): Promise<void> => {
      const created: Response = await request(app.getHttpServer())
        .post(`/admin/items/${itemId}/copies`)
        .send({ location_id: locationId, condition: ItemCondition.Good });

      const createdBody = created.body as ItemCopy;

      await request(app.getHttpServer())
        .delete(`/admin/items/${itemId}/copies/${createdBody.id}`)
        .expect(StatusCodes.OK)
        .expect((res: Response) => {
          const body = res.body as ItemCopy;
          expect(body.archived_at).not.toBeNull();
        });
    });

    it('should return 404 when item copy does not exist', async (): Promise<void> => {
      await request(app.getHttpServer())
        .delete(`/admin/items/${itemId}/copies/9999`)
        .expect(StatusCodes.NOT_FOUND);
    });
  });

  describe('/items/:id (GET) — includes copies', (): void => {
    it('should include copies with location in item detail', async (): Promise<void> => {
      await request(app.getHttpServer())
        .post(`/admin/items/${itemId}/copies`)
        .send({ location_id: locationId, condition: ItemCondition.Good });

      await request(app.getHttpServer())
        .get(`/items/${itemId}`)
        .expect(StatusCodes.OK)
        .expect((res: Response) => {
          const body = res.body as Item;
          expect(body.copies).toBeDefined();
          expect(Array.isArray(body.copies)).toBe(true);
          expect((body.copies ?? []).length).toBe(1);
          expect((body.copies ?? [])[0].location).toBeDefined();
          expect((body.copies ?? [])[0].condition).toBe(ItemCondition.Good);
        });
    });

    it('should return empty copies array when item has no copies', async (): Promise<void> => {
      await request(app.getHttpServer())
        .get(`/items/${itemId}`)
        .expect(StatusCodes.OK)
        .expect((res: Response) => {
          const body = res.body as Item;
          expect(body.copies).toEqual([]);
        });
    });
  });
});
