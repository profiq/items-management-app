import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { In, Repository, SelectQueryBuilder } from 'typeorm';
import { ItemsService } from './items.service';
import { Item } from './entities/item.entity';
import { Category } from '@/categories/entities/category.entity';
import { Tag } from '@/tags/entities/tag.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

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

function setupFindOneQb(returnValue: Item | null): void {
  const qb = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockResolvedValue(returnValue),
  };
  mockItemRepository.createQueryBuilder.mockReturnValue(
    qb as unknown as SelectQueryBuilder<Item>
  );
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
      });
      expect(mockTagRepository.findBy).toHaveBeenCalledWith({ id: In([1]) });
      expect(result.categories).toEqual([mockCategory]);
      expect(result.tags).toEqual([mockTag]);
    });
  });

  describe('findAll', (): void => {
    it('should return all items with relations', async (): Promise<void> => {
      const items: Item[] = [mockItem];
      mockItemRepository.find.mockResolvedValue(items);

      const result = await service.findAll();

      expect(mockItemRepository.find).toHaveBeenCalledWith({
        relations: ['categories', 'tags'],
      });
      expect(result).toEqual(items);
    });

    it('should return empty array when no items exist', async (): Promise<void> => {
      mockItemRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', (): void => {
    it('should return an item with only non-archived copies', async (): Promise<void> => {
      setupFindOneQb(mockItem);

      const result = await service.findOne(1);

      expect(mockItemRepository.createQueryBuilder).toHaveBeenCalledWith(
        'item'
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
      });
      expect(result.categories).toEqual([mockCategory]);
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
    it('should remove the item', async (): Promise<void> => {
      setupFindOneQb(mockItem);
      mockItemRepository.remove.mockResolvedValue(mockItem);

      await service.remove(1);

      expect(mockItemRepository.remove).toHaveBeenCalledWith(mockItem);
    });

    it('should throw NotFoundException when item does not exist', async (): Promise<void> => {
      setupFindOneQb(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
