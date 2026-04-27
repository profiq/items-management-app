import { Test, TestingModule } from '@nestjs/testing';
import request, { Response } from 'supertest';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatusCodes } from 'http-status-codes';
import { TagsModule } from '@/tags/tags.module';
import { TagsAdminController } from '@/admin/tags.admin.controller';
import { AuthGuard } from '@/auth/auth.guard';
import { RolesGuard } from '@/auth/roles.guard';
import { Tag } from '@/tags/entities/tag.entity';
import { dbConfig } from './database';

describe('TagsModule (e2e)', (): void => {
  let app: INestApplication<App>;

  beforeEach(async (): Promise<void> => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TagsModule, TypeOrmModule.forRoot(dbConfig)],
      controllers: [TagsAdminController],
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

  describe('/admin/tags (POST)', (): void => {
    it('should create a tag', async (): Promise<void> => {
      await request(app.getHttpServer())
        .post('/admin/tags')
        .send({ name: 'Fiction' })
        .expect(StatusCodes.CREATED)
        .expect((res: Response) => {
          const body = res.body as Tag;
          expect(body.id).toBeDefined();
          expect(body.name).toBe('Fiction');
        });
    });
  });

  describe('/tags (GET)', (): void => {
    it('should return all tags', async (): Promise<void> => {
      await request(app.getHttpServer())
        .post('/admin/tags')
        .send({ name: 'Fiction' });
      await request(app.getHttpServer())
        .post('/admin/tags')
        .send({ name: 'Science' });

      await request(app.getHttpServer())
        .get('/tags')
        .expect(StatusCodes.OK)
        .expect((res: Response) => {
          const body = res.body as Tag[];
          expect(Array.isArray(body)).toBe(true);
          expect(body).toHaveLength(2);
          expect(body[0].name).toBe('Fiction');
          expect(body[1].name).toBe('Science');
        });
    });

    it('should return empty array when no tags exist', async (): Promise<void> => {
      await request(app.getHttpServer())
        .get('/tags')
        .expect(StatusCodes.OK)
        .expect([]);
    });
  });

  describe('/tags/:id (GET)', (): void => {
    it('should return a tag by id', async (): Promise<void> => {
      const created: Response = await request(app.getHttpServer())
        .post('/admin/tags')
        .send({ name: 'Fiction' });

      const createdBody = created.body as Tag;

      await request(app.getHttpServer())
        .get(`/tags/${createdBody.id}`)
        .expect(StatusCodes.OK)
        .expect((res: Response) => {
          const body = res.body as Tag;
          expect(body.id).toBe(createdBody.id);
          expect(body.name).toBe('Fiction');
        });
    });

    it('should return 404 when tag does not exist', async (): Promise<void> => {
      await request(app.getHttpServer())
        .get('/tags/9999')
        .expect(StatusCodes.NOT_FOUND);
    });
  });

  describe('/admin/tags/:id (PATCH)', (): void => {
    it('should update a tag', async (): Promise<void> => {
      const created: Response = await request(app.getHttpServer())
        .post('/admin/tags')
        .send({ name: 'Fiction' });

      const createdBody = created.body as Tag;

      await request(app.getHttpServer())
        .patch(`/admin/tags/${createdBody.id}`)
        .send({ name: 'Updated Fiction' })
        .expect(StatusCodes.OK)
        .expect((res: Response) => {
          const body = res.body as Tag;
          expect(body.name).toBe('Updated Fiction');
          expect(body.id).toBe(createdBody.id);
        });
    });

    it('should return 404 when tag does not exist', async (): Promise<void> => {
      await request(app.getHttpServer())
        .patch('/admin/tags/9999')
        .send({ name: 'X' })
        .expect(StatusCodes.NOT_FOUND);
    });
  });

  describe('/admin/tags/:id (DELETE)', (): void => {
    it('should delete a tag', async (): Promise<void> => {
      const created: Response = await request(app.getHttpServer())
        .post('/admin/tags')
        .send({ name: 'Fiction' });

      const createdBody = created.body as Tag;

      await request(app.getHttpServer())
        .delete(`/admin/tags/${createdBody.id}`)
        .expect(StatusCodes.OK);

      await request(app.getHttpServer())
        .get(`/tags/${createdBody.id}`)
        .expect(StatusCodes.NOT_FOUND);
    });

    it('should return 404 when tag does not exist', async (): Promise<void> => {
      await request(app.getHttpServer())
        .delete('/admin/tags/9999')
        .expect(StatusCodes.NOT_FOUND);
    });
  });
});
