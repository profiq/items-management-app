import { Test, TestingModule } from '@nestjs/testing';
import request, { Response } from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { App } from 'supertest/types';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { StatusCodes } from 'http-status-codes';
import { ItemsModule } from '@/items/items.module';
import { ItemsAdminController } from '@/admin/items.admin.controller';
import { CategoriesAdminController } from '@/admin/categories.admin.controller';
import { TagsAdminController } from '@/admin/tags.admin.controller';
import { CitiesAdminController } from '@/admin/cities.admin.controller';
import { LocationsAdminController } from '@/admin/locations.admin.controller';
import { ItemCopiesAdminController } from '@/admin/item-copies.admin.controller';
import { AuthGuard } from '@/auth/auth.guard';
import { RolesGuard } from '@/auth/roles.guard';
import { AuthService } from '@/auth/auth.service';
import { FirebaseService } from '@/firebase/firebase.service';
import { CategoriesModule } from '@/categories/categories.module';
import { CitiesModule } from '@/cities/cities.module';
import { ItemCopiesModule } from '@/item-copies/item-copies.module';
import { LocationsModule } from '@/locations/locations.module';
import { TagsModule } from '@/tags/tags.module';
import { Item } from '@/items/entities/item.entity';
import { Category } from '@/categories/entities/category.entity';
import { Tag } from '@/tags/entities/tag.entity';
import { PaginatedItemsResponseDto } from '@/items/dto/paginated-items-response.dto';
import { User, UserRole } from '@/user/user.entity';
import { dbConfig } from './database';

type IdResponseBody = { id: number };

const responseId = (res: Response): number => (res.body as IdResponseBody).id;

describe('ItemsModule (e2e)', (): void => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

  beforeEach(async (): Promise<void> => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ItemsModule,
        CategoriesModule,
        CitiesModule,
        ItemCopiesModule,
        LocationsModule,
        TagsModule,
        TypeOrmModule.forRoot(dbConfig),
      ],
      controllers: [
        ItemsAdminController,
        CategoriesAdminController,
        CitiesAdminController,
        LocationsAdminController,
        ItemCopiesAdminController,
        TagsAdminController,
      ],
    })
      .overrideProvider(FirebaseService)
      .useValue({})
      .overrideProvider(AuthService)
      .useValue({ verifyToken: jest.fn() })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
    dataSource = app.get(DataSource);
  });

  afterEach(async (): Promise<void> => {
    if (app && typeof app.close === 'function') {
      await app.close();
    }
  });

  describe('/admin/items (POST)', (): void => {
    it('should create an item without categories or tags', async (): Promise<void> => {
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
          expect(body.categories).toEqual([]);
          expect(body.tags).toEqual([]);
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

    it('should create an item with categories and tags', async (): Promise<void> => {
      const catRes: Response = await request(app.getHttpServer())
        .post('/admin/categories')
        .send({ name: 'Books' });
      const tagRes: Response = await request(app.getHttpServer())
        .post('/admin/tags')
        .send({ name: 'fiction' });

      const categoryId = (catRes.body as Category).id;
      const tagId = (tagRes.body as Tag).id;

      await request(app.getHttpServer())
        .post('/admin/items')
        .send({
          name: 'Clean Code',
          default_loan_days: 14,
          categoryIds: [categoryId],
          tagIds: [tagId],
        })
        .expect(StatusCodes.CREATED)
        .expect((res: Response) => {
          const body = res.body as Item;
          expect(body.categories).toHaveLength(1);
          expect(body.categories[0].id).toBe(categoryId);
          expect(body.tags).toHaveLength(1);
          expect(body.tags[0].id).toBe(tagId);
        });
    });
  });

  describe('/items (GET)', (): void => {
    const createBorrower = async (): Promise<User> =>
      dataSource.getRepository(User).save({
        name: 'Borrower',
        employee_id: `emp-${Date.now()}-${Math.random()}`,
        role: UserRole.User,
      });

    const createActiveLoan = async (
      copyId: number,
      userId: number
    ): Promise<void> => {
      await dataSource.query(
        `INSERT INTO loan (
          copy_id,
          user_id,
          borrowed_at,
          due_date,
          returned_at,
          returned_by_user_id
        ) VALUES (?, ?, ?, ?, NULL, NULL)`,
        [copyId, userId, new Date().toISOString(), '2026-05-01']
      );
    };

    const createLocation = async (): Promise<number> => {
      const cityRes: Response = await request(app.getHttpServer())
        .post('/admin/cities')
        .send({ name: 'Prague' });

      const locationRes: Response = await request(app.getHttpServer())
        .post('/admin/locations')
        .send({
          name: 'HQ Library',
          city_id: responseId(cityRes),
        });

      return responseId(locationRes);
    };

    it('should return paginated items with categories and tags', async (): Promise<void> => {
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
          const body = res.body as PaginatedItemsResponseDto;
          expect(Array.isArray(body.data)).toBe(true);
          expect(body.data).toHaveLength(2);
          expect(body.total).toBe(2);
          expect(body.page).toBe(1);
          expect(body.limit).toBe(20);
          expect(body.data[0].categories).toBeDefined();
          expect(body.data[0].tags).toBeDefined();
        });
    });

    it('should return empty data when no items exist', async (): Promise<void> => {
      await request(app.getHttpServer())
        .get('/items')
        .expect(StatusCodes.OK)
        .expect((res: Response) => {
          const body = res.body as PaginatedItemsResponseDto;
          expect(body.data).toEqual([]);
          expect(body.total).toBe(0);
        });
    });

    it('should filter items by search term', async (): Promise<void> => {
      await request(app.getHttpServer())
        .post('/admin/items')
        .send({ name: 'Clean Code', default_loan_days: 14 });
      await request(app.getHttpServer())
        .post('/admin/items')
        .send({ name: 'Refactoring', default_loan_days: 7 });

      await request(app.getHttpServer())
        .get('/items?search=Clean')
        .expect(StatusCodes.OK)
        .expect((res: Response) => {
          const body = res.body as PaginatedItemsResponseDto;
          expect(body.data).toHaveLength(1);
          expect(body.data[0].name).toBe('Clean Code');
          expect(body.total).toBe(1);
        });
    });

    it('should filter items by categoryId', async (): Promise<void> => {
      const catRes: Response = await request(app.getHttpServer())
        .post('/admin/categories')
        .send({ name: 'Books' });
      const categoryId = (catRes.body as Category).id;

      await request(app.getHttpServer())
        .post('/admin/items')
        .send({
          name: 'Clean Code',
          default_loan_days: 14,
          categoryIds: [categoryId],
        });
      await request(app.getHttpServer())
        .post('/admin/items')
        .send({ name: 'Refactoring', default_loan_days: 7 });

      await request(app.getHttpServer())
        .get(`/items?categoryId=${categoryId}`)
        .expect(StatusCodes.OK)
        .expect((res: Response) => {
          const body = res.body as PaginatedItemsResponseDto;
          expect(body.data).toHaveLength(1);
          expect(body.data[0].name).toBe('Clean Code');
        });
    });

    it('should filter items by availability', async (): Promise<void> => {
      const locationId = await createLocation();
      const borrower = await createBorrower();

      const availableItemRes: Response = await request(app.getHttpServer())
        .post('/admin/items')
        .send({ name: 'Available Laptop', default_loan_days: 14 });
      const availableItemId = responseId(availableItemRes);
      const unavailableItemRes: Response = await request(app.getHttpServer())
        .post('/admin/items')
        .send({ name: 'Unavailable Laptop', default_loan_days: 14 });
      const unavailableItemId = responseId(unavailableItemRes);
      const noCopiesItemRes: Response = await request(app.getHttpServer())
        .post('/admin/items')
        .send({ name: 'No Copies Laptop', default_loan_days: 14 });
      const noCopiesItemId = responseId(noCopiesItemRes);

      const availableCopyRes: Response = await request(app.getHttpServer())
        .post(`/admin/items/${availableItemId}/copies`)
        .send({ location_id: locationId });
      const availableCopyId = responseId(availableCopyRes);
      const unavailableCopyRes: Response = await request(app.getHttpServer())
        .post(`/admin/items/${unavailableItemId}/copies`)
        .send({ location_id: locationId });
      const unavailableCopyId = responseId(unavailableCopyRes);

      await createActiveLoan(unavailableCopyId, borrower.id);

      await request(app.getHttpServer())
        .get('/items?available=true')
        .expect(StatusCodes.OK)
        .expect((res: Response) => {
          const body = res.body as PaginatedItemsResponseDto;
          expect(body.data).toHaveLength(1);
          expect(body.data[0].id).toBe(availableItemId);
          expect(body.total).toBe(1);
        });

      await request(app.getHttpServer())
        .get('/items?available=false')
        .expect(StatusCodes.OK)
        .expect((res: Response) => {
          const body = res.body as PaginatedItemsResponseDto;
          expect(body.data).toHaveLength(2);
          expect(body.data.map(item => item.id).sort((a, b) => a - b)).toEqual(
            [unavailableItemId, noCopiesItemId].sort((a, b) => a - b)
          );
          expect(body.total).toBe(2);
        });

      expect(availableCopyId).toBeDefined();
    });

    it('should combine search, category, and availability filters', async (): Promise<void> => {
      const locationId = await createLocation();
      const borrower = await createBorrower();

      const booksRes: Response = await request(app.getHttpServer())
        .post('/admin/categories')
        .send({ name: 'Books' });
      const categoryId = (booksRes.body as Category).id;

      const matchingItemRes: Response = await request(app.getHttpServer())
        .post('/admin/items')
        .send({
          name: 'Laptop Handbook',
          description: 'Laptop troubleshooting guide',
          default_loan_days: 14,
          categoryIds: [categoryId],
        });
      const matchingItemId = responseId(matchingItemRes);
      const unavailableMatchRes: Response = await request(app.getHttpServer())
        .post('/admin/items')
        .send({
          name: 'Laptop Repair Manual',
          default_loan_days: 14,
          categoryIds: [categoryId],
        });
      const unavailableMatchId = responseId(unavailableMatchRes);
      await request(app.getHttpServer()).post('/admin/items').send({
        name: 'Laptop Stickers',
        default_loan_days: 14,
      });

      const matchingCopyRes: Response = await request(app.getHttpServer())
        .post(`/admin/items/${matchingItemId}/copies`)
        .send({ location_id: locationId });
      const matchingCopyId = responseId(matchingCopyRes);
      const unavailableCopyRes: Response = await request(app.getHttpServer())
        .post(`/admin/items/${unavailableMatchId}/copies`)
        .send({ location_id: locationId });
      const unavailableCopyId = responseId(unavailableCopyRes);

      await createActiveLoan(unavailableCopyId, borrower.id);

      await request(app.getHttpServer())
        .get(`/items?search=laptop&categoryId=${categoryId}&available=true`)
        .expect(StatusCodes.OK)
        .expect((res: Response) => {
          const body = res.body as PaginatedItemsResponseDto;
          expect(body.data).toHaveLength(1);
          expect(body.data[0].id).toBe(matchingItemId);
          expect(body.total).toBe(1);
        });

      expect(matchingCopyId).toBeDefined();
    });

    it('should reject invalid available filter values', async (): Promise<void> => {
      await request(app.getHttpServer())
        .get('/items?available=maybe')
        .expect(StatusCodes.BAD_REQUEST);
    });

    it('should paginate results correctly', async (): Promise<void> => {
      await request(app.getHttpServer())
        .post('/admin/items')
        .send({ name: 'Item A', default_loan_days: 14 });
      await request(app.getHttpServer())
        .post('/admin/items')
        .send({ name: 'Item B', default_loan_days: 14 });
      await request(app.getHttpServer())
        .post('/admin/items')
        .send({ name: 'Item C', default_loan_days: 14 });

      await request(app.getHttpServer())
        .get('/items?page=1&limit=2')
        .expect(StatusCodes.OK)
        .expect((res: Response) => {
          const body = res.body as PaginatedItemsResponseDto;
          expect(body.data).toHaveLength(2);
          expect(body.total).toBe(3);
          expect(body.page).toBe(1);
          expect(body.limit).toBe(2);
        });
    });
  });

  describe('/items/:id (GET)', (): void => {
    it('should return an item with categories and tags', async (): Promise<void> => {
      const catRes: Response = await request(app.getHttpServer())
        .post('/admin/categories')
        .send({ name: 'Books' });
      const categoryId = (catRes.body as Category).id;

      const created: Response = await request(app.getHttpServer())
        .post('/admin/items')
        .send({
          name: 'Clean Code',
          default_loan_days: 14,
          categoryIds: [categoryId],
        });

      const createdBody = created.body as Item;

      await request(app.getHttpServer())
        .get(`/items/${createdBody.id}`)
        .expect(StatusCodes.OK)
        .expect((res: Response) => {
          const body = res.body as Item;
          expect(body.id).toBe(createdBody.id);
          expect(body.categories).toHaveLength(1);
          expect(body.categories[0].id).toBe(categoryId);
        });
    });

    it('should return 404 when item does not exist', async (): Promise<void> => {
      await request(app.getHttpServer())
        .get('/items/9999')
        .expect(StatusCodes.NOT_FOUND);
    });
  });

  describe('/admin/items/:id (GET)', (): void => {
    it('should return 400 for non-numeric id', async (): Promise<void> => {
      await request(app.getHttpServer())
        .get('/admin/items/not-a-number')
        .expect(StatusCodes.BAD_REQUEST);
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

    it('should replace categories on update', async (): Promise<void> => {
      const catRes: Response = await request(app.getHttpServer())
        .post('/admin/categories')
        .send({ name: 'Books' });
      const categoryId = (catRes.body as Category).id;

      const created: Response = await request(app.getHttpServer())
        .post('/admin/items')
        .send({ name: 'Clean Code', default_loan_days: 14 });

      const createdBody = created.body as Item;

      await request(app.getHttpServer())
        .patch(`/admin/items/${createdBody.id}`)
        .send({ categoryIds: [categoryId] })
        .expect(StatusCodes.OK)
        .expect((res: Response) => {
          const body = res.body as Item;
          expect(body.categories).toHaveLength(1);
          expect(body.categories[0].id).toBe(categoryId);
        });
    });

    it('should return 404 when item does not exist', async (): Promise<void> => {
      await request(app.getHttpServer())
        .patch('/admin/items/9999')
        .send({ name: 'X' })
        .expect(StatusCodes.NOT_FOUND);
    });

    it('should return 400 for non-numeric id', async (): Promise<void> => {
      await request(app.getHttpServer())
        .patch('/admin/items/not-a-number')
        .send({ name: 'X' })
        .expect(StatusCodes.BAD_REQUEST);
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

    it('should return 400 for non-numeric id', async (): Promise<void> => {
      await request(app.getHttpServer())
        .delete('/admin/items/not-a-number')
        .expect(StatusCodes.BAD_REQUEST);
    });
  });
});
