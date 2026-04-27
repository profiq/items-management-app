import { Test, TestingModule } from '@nestjs/testing';
import request, { Response } from 'supertest';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatusCodes } from 'http-status-codes';
import { CategoriesModule } from '@/categories/categories.module';
import { CategoriesAdminController } from '@/admin/categories.admin.controller';
import { AuthGuard } from '@/auth/auth.guard';
import { RolesGuard } from '@/auth/roles.guard';
import { Category } from '@/categories/entities/category.entity';
import { dbConfig } from './database';

describe('CategoriesModule', (): void => {
  let app: INestApplication<App>;

  beforeEach(async (): Promise<void> => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CategoriesModule, TypeOrmModule.forRoot(dbConfig)],
      controllers: [CategoriesAdminController],
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

  describe('/admin/categories (POST)', (): void => {
    it('should create a category', async (): Promise<void> => {
      await request(app.getHttpServer())
        .post('/admin/categories')
        .send({ name: 'Electronics' })
        .expect(StatusCodes.CREATED)
        .expect((res: Response) => {
          const body = res.body as Category;
          expect(body.id).toBeDefined();
          expect(body.name).toBe('Electronics');
          expect(body.archived_at).toBeNull();
        });
    });
  });

  describe('/categories (GET)', (): void => {
    it('should return all categories', async (): Promise<void> => {
      await request(app.getHttpServer())
        .post('/admin/categories')
        .send({ name: 'Electronics' });

      await request(app.getHttpServer())
        .get('/categories')
        .expect(StatusCodes.OK)
        .expect((res: Response) => {
          const body = res.body as Category[];
          expect(Array.isArray(body)).toBe(true);
          expect(body.length).toBe(1);
          expect(body[0].name).toBe('Electronics');
        });
    });

    it('should return empty array when no categories exist', async (): Promise<void> => {
      await request(app.getHttpServer())
        .get('/categories')
        .expect(StatusCodes.OK)
        .expect([]);
    });
  });

  describe('/categories/:id (GET)', (): void => {
    it('should return a category by id', async (): Promise<void> => {
      const created: Response = await request(app.getHttpServer())
        .post('/admin/categories')
        .send({ name: 'Electronics' });

      const createdBody = created.body as Category;

      await request(app.getHttpServer())
        .get(`/categories/${createdBody.id}`)
        .expect(StatusCodes.OK)
        .expect((res: Response) => {
          const body = res.body as Category;
          expect(body.id).toBe(createdBody.id);
          expect(body.name).toBe('Electronics');
        });
    });

    it('should return 404 when category does not exist', async (): Promise<void> => {
      await request(app.getHttpServer())
        .get('/categories/999')
        .expect(StatusCodes.NOT_FOUND);
    });
  });

  describe('/admin/categories/:id (PATCH)', (): void => {
    it('should update a category', async (): Promise<void> => {
      const created: Response = await request(app.getHttpServer())
        .post('/admin/categories')
        .send({ name: 'Electronics' });

      const createdBody = created.body as Category;

      await request(app.getHttpServer())
        .patch(`/admin/categories/${createdBody.id}`)
        .send({ name: 'Updated' })
        .expect(StatusCodes.OK)
        .expect((res: Response) => {
          const body = res.body as Category;
          expect(body.name).toBe('Updated');
        });
    });

    it('should return 404 when category does not exist', async (): Promise<void> => {
      await request(app.getHttpServer())
        .patch('/admin/categories/999')
        .send({ name: 'Updated' })
        .expect(StatusCodes.NOT_FOUND);
    });
  });

  describe('/admin/categories/:id (DELETE)', (): void => {
    it('should delete a category', async (): Promise<void> => {
      const created: Response = await request(app.getHttpServer())
        .post('/admin/categories')
        .send({ name: 'Electronics' });

      const createdBody = created.body as Category;

      await request(app.getHttpServer())
        .delete(`/admin/categories/${createdBody.id}`)
        .expect(StatusCodes.OK);

      await request(app.getHttpServer())
        .get(`/categories/${createdBody.id}`)
        .expect(StatusCodes.NOT_FOUND);
    });

    it('should return 404 when category does not exist', async (): Promise<void> => {
      await request(app.getHttpServer())
        .delete('/admin/categories/999')
        .expect(StatusCodes.NOT_FOUND);
    });
  });
});
