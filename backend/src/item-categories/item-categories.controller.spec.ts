import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ItemCategoriesController } from './item-categories.controller';
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

const mockService: jest.Mocked<
  Pick<ItemCategoriesService, 'create' | 'findAll' | 'findByItem' | 'remove'>
> = {
  create: jest.fn(),
  findAll: jest.fn(),
  findByItem: jest.fn(),
  remove: jest.fn(),
};

describe('ItemCategoriesController', (): void => {
  let controller: ItemCategoriesController;

  beforeEach(async (): Promise<void> => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemCategoriesController],
      providers: [
        {
          provide: ItemCategoriesService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ItemCategoriesController>(ItemCategoriesController);
    jest.clearAllMocks();
  });

  describe('create', (): void => {
    it('should create and return an item-category', async (): Promise<void> => {
      const dto: CreateItemCategoryDto = { item_id: 1, category_id: 1 };
      mockService.create.mockResolvedValue(mockItemCategory);

      const result: ItemCategory = await controller.create(dto);

      expect(mockService.create).toHaveBeenCalledWith(dto);
      expect(result).toStrictEqual(mockItemCategory);
    });

    it('should propagate ConflictException when relation already exists', async (): Promise<void> => {
      mockService.create.mockRejectedValue(new ConflictException());

      await expect(
        controller.create({ item_id: 1, category_id: 1 })
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', (): void => {
    it('should return all item-categories', async (): Promise<void> => {
      mockService.findAll.mockResolvedValue([mockItemCategory]);

      const result: ItemCategory[] = await controller.findAll();

      expect(mockService.findAll).toHaveBeenCalled();
      expect(result).toStrictEqual([mockItemCategory]);
    });
  });

  describe('findByItem', (): void => {
    it('should return categories for a given item', async (): Promise<void> => {
      mockService.findByItem.mockResolvedValue([mockItemCategory]);

      const result: ItemCategory[] = await controller.findByItem('1');

      expect(mockService.findByItem).toHaveBeenCalledWith(1);
      expect(result).toStrictEqual([mockItemCategory]);
    });
  });

  describe('remove', (): void => {
    it('should remove the item-category relation', async (): Promise<void> => {
      mockService.remove.mockResolvedValue(undefined);

      await controller.remove('1', '1');

      expect(mockService.remove).toHaveBeenCalledWith(1, 1);
    });

    it('should propagate NotFoundException when relation does not exist', async (): Promise<void> => {
      mockService.remove.mockRejectedValue(new NotFoundException());

      await expect(controller.remove('1', '99')).rejects.toThrow(
        NotFoundException
      );
    });
  });
});
