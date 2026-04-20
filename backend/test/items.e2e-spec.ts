import { Test, TestingModule } from '@nestjs/testing';
import request, { Response } from 'supertest';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatusCodes } from 'http-status-codes';
import { ItemsModule } from '@/items/items.module';
import { ItemsAdminController } from '@/admin/items.admin.controller';
import { AuthGuard } from '@/auth/auth.guard';
import { RolesGuard } from '@/auth/roles.guard';
import { Item } from '@/items/entities/item.entity';
import { dbConfig } from './database';

describe('ItemsModule (e2e)', (): void => {
  let app: INestApplication<App>;

  beforeEach(async (): Promise<void> => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ItemsModule, TypeOrmModule.forRoot(dbConfig)],
      controllers: [ItemsAdminController],
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

  describe('/admin/items (POST)', (): void => {
    it('should create an item without optional fields', async (): Promise<void> => {
      await request(app.getHttpServer())
        .post('/admin/items')
        .send({ name: 'Clean Code', default_loan_days: 14 })
        .expect(StatusCodes.CREATED)
        .expect((res: Response) => {
          const body = res.body as Item;
          expect(body.id).toBeDefined();
          expect(body.name).toBe('Clean Code');
          expect(body.default_loan_days).toBe(14);
          expect(body.description).toBeNull();
          expect(body.image_url).toBeNull();
          expect(body.archived_at).toBeNull();
        });
    });

    it('should create an item with optional fields', async (): Promise<void> => {
      await request(app.getHttpServer())
        .post('/admin/items')
        .send({
          name: 'The Pragmatic Programmer',
          description: 'A classic book',
          image_url: 'https://example.com/img.png',
          default_loan_days: 21,
        })
        .expect(StatusCodes.CREATED)
        .expect((res: Response) => {
          const body = res.body as Item;
          expect(body.description).toBe('A classic book');
          expect(body.image_url).toBe('https://example.com/img.png');
        });
    });
  });

  describe('/items (GET)', (): void => {
    it('should return all items', async (): Promise<void> => {
      await request(app.getHttpServer())
        .post('/admin/items')
        .send({ name: 'Clean Code', default_loan_days: 14 });
      await request(app.getHttpServer())
        .post('/admin/items')
        .send({ name: 'Refactoring', default_loan_days: 7 });

      await request(app.getHttpServer())
        .get('/items')
        .expect(StatusCodes.OK)
        .expect((res: Response) => {
          const body = res.body as Item[];
          expect(Array.isArray(body)).toBe(true);
          expect(body).toHaveLength(2);
        });
    });

    it('should return empty array when no items exist', async (): Promise<void> => {
      await request(app.getHttpServer())
        .get('/items')
        .expect(StatusCodes.OK)
        .expect([]);
    });
  });

  describe('/items/:id (GET)', (): void => {
    it('should return an item by id', async (): Promise<void> => {
      const created: Response = await request(app.getHttpServer())
        .post('/admin/items')
        .send({ name: 'Clean Code', default_loan_days: 14 });

      const createdBody = created.body as Item;

      await request(app.getHttpServer())
        .get(`/items/${createdBody.id}`)
        .expect(StatusCodes.OK)
        .expect((res: Response) => {
          const body = res.body as Item;
          expect(body.id).toBe(createdBody.id);
          expect(body.name).toBe('Clean Code');
        });
    });

    it('should return 404 when item does not exist', async (): Promise<void> => {
      await request(app.getHttpServer())
        .get('/items/9999')
        .expect(StatusCodes.NOT_FOUND);
    });
  });

  describe('/admin/items/:id (PATCH)', (): void => {
    it('should update scalar fields', async (): Promise<void> => {
      const created: Response = await request(app.getHttpServer())
        .post('/admin/items')
        .send({ name: 'Clean Code', default_loan_days: 14 });

      const createdBody = created.body as Item;

      await request(app.getHttpServer())
        .patch(`/admin/items/${createdBody.id}`)
        .send({ name: 'Clean Code 2nd Edition', default_loan_days: 21 })
        .expect(StatusCodes.OK)
        .expect((res: Response) => {
          const body = res.body as Item;
          expect(body.name).toBe('Clean Code 2nd Edition');
          expect(body.default_loan_days).toBe(21);
          expect(body.id).toBe(createdBody.id);
        });
    });

    it('should return 404 when item does not exist', async (): Promise<void> => {
      await request(app.getHttpServer())
        .patch('/admin/items/9999')
        .send({ name: 'X' })
        .expect(StatusCodes.NOT_FOUND);
    });
  });

  describe('/admin/items/:id (DELETE)', (): void => {
    it('should delete an item', async (): Promise<void> => {
      const created: Response = await request(app.getHttpServer())
        .post('/admin/items')
        .send({ name: 'Clean Code', default_loan_days: 14 });

      const createdBody = created.body as Item;

      await request(app.getHttpServer())
        .delete(`/admin/items/${createdBody.id}`)
        .expect(StatusCodes.OK);

      await request(app.getHttpServer())
        .get(`/items/${createdBody.id}`)
        .expect(StatusCodes.NOT_FOUND);
    });

    it('should return 404 when item does not exist', async (): Promise<void> => {
      await request(app.getHttpServer())
        .delete('/admin/items/9999')
        .expect(StatusCodes.NOT_FOUND);
    });
  });
});
