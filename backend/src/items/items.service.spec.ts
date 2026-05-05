import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { In, IsNull, Repository, SelectQueryBuilder } from 'typeorm';
import { ItemsService } from './items.service';
import { Item } from './entities/item.entity';
import { Category } from '@/categories/entities/category.entity';
import { Tag } from '@/tags/entities/tag.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { FindItemsQueryDto } from './dto/find-items-query.dto';

const mockCategory: Category = { id: 1, name: 'Books', archived_at: null };
const mockTag: Tag = { id: 1, name: 'fiction' };

const mockItem: Item = {
  id: 1,
  name: 'Clean Code',
  description: 'A book about clean code',
  image_url: null,
  default_loan_days: 14,
  archived_at: null,
  categories: [],
  tags: [],
};

const mockItemRepository: jest.Mocked<
  Pick<
    Repository<Item>,
    'create' | 'save' | 'find' | 'findOne' | 'remove' | 'createQueryBuilder'
  >
> = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
  createQueryBuilder: jest.fn(),
};

function setupFindOneQb(returnValue: Item | null): {
  leftJoinAndSelect: jest.Mock;
  where: jest.Mock;
  andWhere: jest.Mock;
  getOne: jest.Mock;
} {
  const qb = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockResolvedValue(returnValue),
  };
  mockItemRepository.createQueryBuilder.mockReturnValue(
    qb as unknown as SelectQueryBuilder<Item>
  );
  return qb;
}

const mockCategoryRepository: jest.Mocked<
  Pick<Repository<Category>, 'findBy'>
> = {
  findBy: jest.fn(),
};

const mockTagRepository: jest.Mocked<Pick<Repository<Tag>, 'findBy'>> = {
  findBy: jest.fn(),
};

describe('ItemsService', (): void => {
  let service: ItemsService;

  beforeEach(async (): Promise<void> => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemsService,
        { provide: getRepositoryToken(Item), useValue: mockItemRepository },
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoryRepository,
        },
        { provide: getRepositoryToken(Tag), useValue: mockTagRepository },
      ],
    }).compile();

    service = module.get<ItemsService>(ItemsService);
    jest.clearAllMocks();
  });

  describe('create', (): void => {
    it('should create and return an item without categories/tags', async (): Promise<void> => {
      const dto: CreateItemDto = {
        name: 'Clean Code',
        description: 'A book about clean code',
        default_loan_days: 14,
      };
      mockItemRepository.create.mockReturnValue({ ...mockItem });
      mockItemRepository.save.mockResolvedValue(mockItem);

      const result = await service.create(dto);

      expect(mockItemRepository.create).toHaveBeenCalledWith({
        name: 'Clean Code',
        description: 'A book about clean code',
        image_url: null,
        default_loan_days: 14,
        archived_at: null,
      });
      expect(mockCategoryRepository.findBy).not.toHaveBeenCalled();
      expect(mockTagRepository.findBy).not.toHaveBeenCalled();
      expect(result).toEqual(mockItem);
    });

    it('should default description and image_url to null when not provided', async (): Promise<void> => {
      const dto: CreateItemDto = { name: 'Clean Code', default_loan_days: 14 };
      mockItemRepository.create.mockReturnValue({ ...mockItem });
      mockItemRepository.save.mockResolvedValue(mockItem);

      await service.create(dto);

      expect(mockItemRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ description: null, image_url: null })
      );
    });

    it('should assign categories and tags when IDs are provided', async (): Promise<void> => {
      const dto: CreateItemDto = {
        name: 'Clean Code',
        default_loan_days: 14,
        categoryIds: [1],
        tagIds: [1],
      };
      const itemWithoutRelations = { ...mockItem, categories: [], tags: [] };
      mockItemRepository.create.mockReturnValue(itemWithoutRelations);
      mockCategoryRepository.findBy.mockResolvedValue([mockCategory]);
      mockTagRepository.findBy.mockResolvedValue([mockTag]);
      mockItemRepository.save.mockResolvedValue({
        ...mockItem,
        categories: [mockCategory],
        tags: [mockTag],
      });

      const result = await service.create(dto);

      expect(mockCategoryRepository.findBy).toHaveBeenCalledWith({
        id: In([1]),
        archived_at: IsNull(),
      });
      expect(mockTagRepository.findBy).toHaveBeenCalledWith({ id: In([1]) });
      expect(result.categories).toEqual([mockCategory]);
      expect(result.tags).toEqual([mockTag]);
    });
  });

  describe('findAll', (): void => {
    let mockQb: jest.Mocked<{
      distinct: jest.Mock;
      leftJoinAndSelect: jest.Mock;
      innerJoin: jest.Mock;
      where: jest.Mock;
      andWhere: jest.Mock;
      orderBy: jest.Mock;
      skip: jest.Mock;
      take: jest.Mock;
      getManyAndCount: jest.Mock;
    }>;

    beforeEach((): void => {
      mockQb = {
        distinct: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn(),
      };
      mockItemRepository.createQueryBuilder.mockReturnValue(
        mockQb as unknown as SelectQueryBuilder<Item>
      );
    });

    it('should return paginated active items with default page and limit', async (): Promise<void> => {
      const items: Item[] = [mockItem];
      mockQb.getManyAndCount.mockResolvedValue([items, 1]);

      const result = await service.findAll({} as FindItemsQueryDto);

      expect(mockItemRepository.createQueryBuilder).toHaveBeenCalledWith(
        'item'
      );
      expect(mockQb.distinct).toHaveBeenCalledWith(true);
      expect(mockQb.where).toHaveBeenCalledWith('item.archived_at IS NULL');
      expect(mockQb.skip).toHaveBeenCalledWith(0);
      expect(mockQb.take).toHaveBeenCalledWith(20);
      expect(result).toEqual({ data: items, total: 1, page: 1, limit: 20 });
    });

    it('should return empty result when no items exist', async (): Promise<void> => {
      mockQb.getManyAndCount.mockResolvedValue([[], 0]);

      const result = await service.findAll({} as FindItemsQueryDto);

      expect(result).toEqual({ data: [], total: 0, page: 1, limit: 20 });
    });

    it('should apply search filter on name and description', async (): Promise<void> => {
      mockQb.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ search: 'laptop' } as FindItemsQueryDto);

      expect(mockQb.andWhere).toHaveBeenCalledWith(
        '(item.name LIKE :search OR item.description LIKE :search)',
        { search: '%laptop%' }
      );
    });

    it('should apply category filter via inner join', async (): Promise<void> => {
      mockQb.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ categoryId: 1 } as FindItemsQueryDto);

      expect(mockQb.innerJoin).toHaveBeenCalledWith(
        'item.categories',
        'filterCategory',
        'filterCategory.id = :categoryId AND filterCategory.archived_at IS NULL',
        { categoryId: 1 }
      );
    });

    it('should apply availability filter with EXISTS subquery', async (): Promise<void> => {
      mockQb.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ available: true } as FindItemsQueryDto);

      expect(mockQb.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('EXISTS')
      );
    });

    it('should apply unavailable filter when available is false', async (): Promise<void> => {
      mockQb.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ available: false } as FindItemsQueryDto);

      expect(mockQb.andWhere).toHaveBeenCalledWith(
        expect.stringMatching(/NOT EXISTS[\s\S]+item_copy/)
      );
    });

    it('should paginate correctly with custom page and limit', async (): Promise<void> => {
      mockQb.getManyAndCount.mockResolvedValue([[], 0]);

      const result = await service.findAll({
        page: 3,
        limit: 10,
      } as FindItemsQueryDto);

      expect(mockQb.skip).toHaveBeenCalledWith(20);
      expect(mockQb.take).toHaveBeenCalledWith(10);
      expect(result.page).toBe(3);
      expect(result.limit).toBe(10);
    });
  });

  describe('findOne', (): void => {
    it('should return an item with only non-archived copies', async (): Promise<void> => {
      const qb = setupFindOneQb(mockItem);

      const result = await service.findOne(1);

      expect(mockItemRepository.createQueryBuilder).toHaveBeenCalledWith(
        'item'
      );
      expect(qb.leftJoinAndSelect).toHaveBeenCalledWith(
        'item.copies',
        'copy',
        'copy.archived_at IS NULL'
      );
      expect(result).toEqual(mockItem);
    });

    it('should throw NotFoundException when item does not exist', async (): Promise<void> => {
      setupFindOneQb(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(99)).rejects.toThrow('Item #99 not found');
    });
  });

  describe('update', (): void => {
    it('should update scalar fields without touching relations when IDs not provided', async (): Promise<void> => {
      const dto: UpdateItemDto = { name: 'Updated Code', default_loan_days: 7 };
      const updated: Item = {
        ...mockItem,
        name: 'Updated Code',
        default_loan_days: 7,
      };
      setupFindOneQb({ ...mockItem });
      mockItemRepository.save.mockResolvedValue(updated);

      const result = await service.update(1, dto);

      expect(mockCategoryRepository.findBy).not.toHaveBeenCalled();
      expect(mockTagRepository.findBy).not.toHaveBeenCalled();
      expect(result.name).toBe('Updated Code');
    });

    it('should replace categories when categoryIds provided', async (): Promise<void> => {
      const dto: UpdateItemDto = { categoryIds: [1] };
      setupFindOneQb({ ...mockItem });
      mockCategoryRepository.findBy.mockResolvedValue([mockCategory]);
      mockItemRepository.save.mockResolvedValue({
        ...mockItem,
        categories: [mockCategory],
      });

      const result = await service.update(1, dto);

      expect(mockCategoryRepository.findBy).toHaveBeenCalledWith({
        id: In([1]),
        archived_at: IsNull(),
      });
      expect(result.categories).toEqual([mockCategory]);
    });

    it('should reject archived or missing categories', async (): Promise<void> => {
      setupFindOneQb({ ...mockItem });
      mockCategoryRepository.findBy.mockResolvedValue([]);

      await expect(service.update(1, { categoryIds: [1] })).rejects.toThrow(
        NotFoundException
      );
    });

    it('should clear categories when categoryIds is empty array', async (): Promise<void> => {
      const dto: UpdateItemDto = { categoryIds: [] };
      setupFindOneQb({ ...mockItem, categories: [mockCategory] });
      mockItemRepository.save.mockResolvedValue({
        ...mockItem,
        categories: [],
      });

      const result = await service.update(1, dto);

      expect(mockCategoryRepository.findBy).not.toHaveBeenCalled();
      expect(result.categories).toEqual([]);
    });

    it('should throw NotFoundException when item does not exist', async (): Promise<void> => {
      setupFindOneQb(null);

      await expect(service.update(99, { name: 'X' })).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('remove', (): void => {
    it('should archive the item', async (): Promise<void> => {
      setupFindOneQb(mockItem);
      mockItemRepository.save.mockResolvedValue({
        ...mockItem,
        archived_at: new Date(),
      });

      await service.remove(1);

      expect(mockItemRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ archived_at: expect.any(Date) as Date })
      );
      expect(mockItemRepository.remove).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when item does not exist', async (): Promise<void> => {
      setupFindOneQb(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
