import { Test, TestingModule } from '@nestjs/testing';
import request, { Response } from 'supertest';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatusCodes } from 'http-status-codes';
import { ItemCategoriesModule } from '@/item-categories/item-categories.module';
import { ItemsModule } from '@/items/items.module';
import { CategoriesModule } from '@/categories/categories.module';
import { ItemsAdminController } from '@/admin/items.admin.controller';
import { CategoriesAdminController } from '@/admin/categories.admin.controller';
import { AuthGuard } from '@/auth/auth.guard';
import { RolesGuard } from '@/auth/roles.guard';
import { ItemCategory } from '@/item-categories/entities/item-category.entity';
import { dbConfig } from './database';

describe('ItemCategoriesModule (e2e)', (): void => {
  let app: INestApplication<App>;
  let itemId: number;
  let categoryId: number;

  beforeEach(async (): Promise<void> => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ItemCategoriesModule,
        ItemsModule,
        CategoriesModule,
        TypeOrmModule.forRoot(dbConfig),
      ],
      controllers: [ItemsAdminController, CategoriesAdminController],
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

    const categoryRes: Response = await request(app.getHttpServer())
      .post('/admin/categories')
      .send({ name: 'Fiction' });
    categoryId = (categoryRes.body as { id: number }).id;
  });

  afterEach(async (): Promise<void> => {
    await app.close();
  });

  describe('/item-categories (POST)', (): void => {
    it('should create an item-category relation', async (): Promise<void> => {
      await request(app.getHttpServer())
        .post('/item-categories')
        .send({ item_id: itemId, category_id: categoryId })
        .expect(StatusCodes.CREATED)
        .expect((res: Response) => {
          const body = res.body as ItemCategory;
          expect(body.item_id).toBe(itemId);
          expect(body.category_id).toBe(categoryId);
        });
    });

    it('should return 409 when relation already exists', async (): Promise<void> => {
      await request(app.getHttpServer())
        .post('/item-categories')
        .send({ item_id: itemId, category_id: categoryId });

      await request(app.getHttpServer())
        .post('/item-categories')
        .send({ item_id: itemId, category_id: categoryId })
        .expect(StatusCodes.CONFLICT);
    });
  });

  describe('/item-categories (GET)', (): void => {
    it('should return all item-categories', async (): Promise<void> => {
      await request(app.getHttpServer())
        .post('/item-categories')
        .send({ item_id: itemId, category_id: categoryId });

      await request(app.getHttpServer())
        .get('/item-categories')
        .expect(StatusCodes.OK)
        .expect((res: Response) => {
          const body = res.body as ItemCategory[];
          expect(Array.isArray(body)).toBe(true);
          expect(body).toHaveLength(1);
        });
    });
  });

  describe('/item-categories/item/:itemId (GET)', (): void => {
    it('should return categories for a given item', async (): Promise<void> => {
      await request(app.getHttpServer())
        .post('/item-categories')
        .send({ item_id: itemId, category_id: categoryId });

      await request(app.getHttpServer())
        .get(`/item-categories/item/${itemId}`)
        .expect(StatusCodes.OK)
        .expect((res: Response) => {
          const body = res.body as ItemCategory[];
          expect(body).toHaveLength(1);
          expect(body[0].category_id).toBe(categoryId);
        });
    });

    it('should return empty array when item has no categories', async (): Promise<void> => {
      await request(app.getHttpServer())
        .get(`/item-categories/item/${itemId}`)
        .expect(StatusCodes.OK)
        .expect([]);
    });
  });

  describe('/item-categories/item/:itemId/category/:categoryId (DELETE)', (): void => {
    it('should delete an item-category relation', async (): Promise<void> => {
      await request(app.getHttpServer())
        .post('/item-categories')
        .send({ item_id: itemId, category_id: categoryId });

      await request(app.getHttpServer())
        .delete(`/item-categories/item/${itemId}/category/${categoryId}`)
        .expect(StatusCodes.OK);

      await request(app.getHttpServer())
        .get(`/item-categories/item/${itemId}`)
        .expect(StatusCodes.OK)
        .expect([]);
    });

    it('should return 404 when relation does not exist', async (): Promise<void> => {
      await request(app.getHttpServer())
        .delete(`/item-categories/item/${itemId}/category/9999`)
        .expect(StatusCodes.NOT_FOUND);
    });
  });
});
