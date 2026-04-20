import { Test, TestingModule } from '@nestjs/testing';
import request, { Response } from 'supertest';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatusCodes } from 'http-status-codes';
import { ItemTagsModule } from '@/item-tags/item-tags.module';
import { ItemsModule } from '@/items/items.module';
import { TagsModule } from '@/tags/tags.module';
import { ItemsAdminController } from '@/admin/items.admin.controller';
import { TagsAdminController } from '@/admin/tags.admin.controller';
import { AuthGuard } from '@/auth/auth.guard';
import { RolesGuard } from '@/auth/roles.guard';
import { ItemTag } from '@/item-tags/entities/item-tag.entity';
import { dbConfig } from './database';

describe('ItemTagsModule (e2e)', (): void => {
  let app: INestApplication<App>;
  let itemId: number;
  let tagId: number;

  beforeEach(async (): Promise<void> => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ItemTagsModule,
        ItemsModule,
        TagsModule,
        TypeOrmModule.forRoot(dbConfig),
      ],
      controllers: [ItemsAdminController, TagsAdminController],
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

    const tagRes: Response = await request(app.getHttpServer())
      .post('/admin/tags')
      .send({ name: 'Fiction' });
    tagId = (tagRes.body as { id: number }).id;
  });

  afterEach(async (): Promise<void> => {
    await app.close();
  });

  describe('/item-tags (POST)', (): void => {
    it('should create an item-tag relation', async (): Promise<void> => {
      await request(app.getHttpServer())
        .post('/item-tags')
        .send({ item_id: itemId, tag_id: tagId })
        .expect(StatusCodes.CREATED)
        .expect((res: Response) => {
          const body = res.body as ItemTag;
          expect(body.item_id).toBe(itemId);
          expect(body.tag_id).toBe(tagId);
        });
    });

    it('should return 409 when relation already exists', async (): Promise<void> => {
      await request(app.getHttpServer())
        .post('/item-tags')
        .send({ item_id: itemId, tag_id: tagId });

      await request(app.getHttpServer())
        .post('/item-tags')
        .send({ item_id: itemId, tag_id: tagId })
        .expect(StatusCodes.CONFLICT);
    });
  });

  describe('/item-tags (GET)', (): void => {
    it('should return all item-tags', async (): Promise<void> => {
      await request(app.getHttpServer())
        .post('/item-tags')
        .send({ item_id: itemId, tag_id: tagId });

      await request(app.getHttpServer())
        .get('/item-tags')
        .expect(StatusCodes.OK)
        .expect((res: Response) => {
          const body = res.body as ItemTag[];
          expect(Array.isArray(body)).toBe(true);
          expect(body).toHaveLength(1);
        });
    });
  });

  describe('/item-tags/item/:itemId (GET)', (): void => {
    it('should return tags for a given item', async (): Promise<void> => {
      await request(app.getHttpServer())
        .post('/item-tags')
        .send({ item_id: itemId, tag_id: tagId });

      await request(app.getHttpServer())
        .get(`/item-tags/item/${itemId}`)
        .expect(StatusCodes.OK)
        .expect((res: Response) => {
          const body = res.body as ItemTag[];
          expect(body).toHaveLength(1);
          expect(body[0].tag_id).toBe(tagId);
        });
    });

    it('should return empty array when item has no tags', async (): Promise<void> => {
      await request(app.getHttpServer())
        .get(`/item-tags/item/${itemId}`)
        .expect(StatusCodes.OK)
        .expect([]);
    });
  });

  describe('/item-tags/item/:itemId/tag/:tagId (DELETE)', (): void => {
    it('should delete an item-tag relation', async (): Promise<void> => {
      await request(app.getHttpServer())
        .post('/item-tags')
        .send({ item_id: itemId, tag_id: tagId });

      await request(app.getHttpServer())
        .delete(`/item-tags/item/${itemId}/tag/${tagId}`)
        .expect(StatusCodes.OK);

      await request(app.getHttpServer())
        .get(`/item-tags/item/${itemId}`)
        .expect(StatusCodes.OK)
        .expect([]);
    });

    it('should return 404 when relation does not exist', async (): Promise<void> => {
      await request(app.getHttpServer())
        .delete(`/item-tags/item/${itemId}/tag/9999`)
        .expect(StatusCodes.NOT_FOUND);
    });
  });
});
