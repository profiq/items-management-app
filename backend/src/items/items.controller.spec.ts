import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { Item } from './entities/item.entity';

const mockItem: Item = {
  id: 1,
  name: 'Clean Code',
  description: 'A book about clean code',
  image_url: null,
  default_loan_days: 14,
  archived_at: null,
};

const mockService: jest.Mocked<Pick<ItemsService, 'findAll' | 'findOne'>> = {
  findAll: jest.fn(),
  findOne: jest.fn(),
};

describe('ItemsController', (): void => {
  let controller: ItemsController;

  beforeEach(async (): Promise<void> => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemsController],
      providers: [
        {
          provide: ItemsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ItemsController>(ItemsController);
    jest.clearAllMocks();
  });

  describe('findAll', (): void => {
    it('should return all items', async (): Promise<void> => {
      const items: Item[] = [mockItem];
      mockService.findAll.mockResolvedValue(items);

      const result: Item[] = await controller.findAll();

      expect(mockService.findAll).toHaveBeenCalled();
      expect(result).toBe(items);
    });
  });

  describe('findOne', (): void => {
    it('should return an item by id', async (): Promise<void> => {
      mockService.findOne.mockResolvedValue(mockItem);

      const result: Item = await controller.findOne('1');

      expect(mockService.findOne).toHaveBeenCalledWith(1);
      expect(result).toBe(mockItem);
    });

    it('should propagate NotFoundException when item does not exist', async (): Promise<void> => {
      mockService.findOne.mockRejectedValue(
        new NotFoundException('Item #99 not found')
      );

      await expect(controller.findOne('99')).rejects.toThrow(NotFoundException);
    });
  });
});
