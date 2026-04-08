import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ItemCategoriesService } from './item-categories.service';
import { ItemCategory } from './entities/item-category.entity';
import { CreateItemCategoryDto } from './dto/create-item-category.dto';

const mockItemCategory: ItemCategory = {
  item_id: 1,
  category_id: 1,
  item: {
    id: 1,
    name: 'Clean Code',
    description: null,
    image_url: null,
    default_loan_days: 14,
    archived_at: null,
  },
  category: { id: 1, name: 'Fiction', archived_at: null },
};

const mockRepository: jest.Mocked<
  Pick<
    Repository<ItemCategory>,
    'create' | 'save' | 'find' | 'findOneBy' | 'findBy' | 'remove'
  >
> = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
  findBy: jest.fn(),
  remove: jest.fn(),
};

describe('ItemCategoriesService', (): void => {
  let service: ItemCategoriesService;

  beforeEach(async (): Promise<void> => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemCategoriesService,
        {
          provide: getRepositoryToken(ItemCategory),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ItemCategoriesService>(ItemCategoriesService);
    jest.clearAllMocks();
  });

  describe('create', (): void => {
    it('should create and return an item-category', async (): Promise<void> => {
      const dto: CreateItemCategoryDto = { item_id: 1, category_id: 1 };
      mockRepository.findOneBy.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockItemCategory);
      mockRepository.save.mockResolvedValue(mockItemCategory);

      const result: ItemCategory = await service.create(dto);

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({
        item_id: 1,
        category_id: 1,
      });
      expect(mockRepository.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockItemCategory);
    });

    it('should throw ConflictException when relation already exists', async (): Promise<void> => {
      mockRepository.findOneBy.mockResolvedValue(mockItemCategory);

      await expect(
        service.create({ item_id: 1, category_id: 1 })
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', (): void => {
    it('should return all item-categories', async (): Promise<void> => {
      mockRepository.find.mockResolvedValue([mockItemCategory]);

      const result: ItemCategory[] = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual([mockItemCategory]);
    });
  });

  describe('findByItem', (): void => {
    it('should return categories for a given item', async (): Promise<void> => {
      mockRepository.findBy.mockResolvedValue([mockItemCategory]);

      const result: ItemCategory[] = await service.findByItem(1);

      expect(mockRepository.findBy).toHaveBeenCalledWith({ item_id: 1 });
      expect(result).toEqual([mockItemCategory]);
    });

    it('should return empty array when item has no categories', async (): Promise<void> => {
      mockRepository.findBy.mockResolvedValue([]);

      const result: ItemCategory[] = await service.findByItem(99);

      expect(result).toEqual([]);
    });
  });

  describe('remove', (): void => {
    it('should remove the item-category relation', async (): Promise<void> => {
      mockRepository.findOneBy.mockResolvedValue(mockItemCategory);
      mockRepository.remove.mockResolvedValue(mockItemCategory);

      await service.remove(1, 1);

      expect(mockRepository.remove).toHaveBeenCalledWith(mockItemCategory);
    });

    it('should throw NotFoundException when relation does not exist', async (): Promise<void> => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.remove(1, 99)).rejects.toThrow(NotFoundException);
    });
  });
});
