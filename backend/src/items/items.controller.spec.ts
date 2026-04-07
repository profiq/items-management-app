import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { Item } from './entities/item.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

const mockItem: Item = {
  id: 1,
  name: 'Clean Code',
  description: 'A book about clean code',
  image_url: null,
  default_loan_days: 14,
  archived_at: null,
};

const mockService: jest.Mocked<
  Pick<ItemsService, 'create' | 'findAll' | 'findOne' | 'update' | 'remove'>
> = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
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

  describe('create', (): void => {
    it('should create and return an item', async (): Promise<void> => {
      const dto: CreateItemDto = { name: 'Clean Code', default_loan_days: 14 };
      mockService.create.mockResolvedValue(mockItem);

      const result: Item = await controller.create(dto);

      expect(mockService.create).toHaveBeenCalledWith(dto);
      expect(result).toBe(mockItem);
    });
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

  describe('update', (): void => {
    it('should update and return the item', async (): Promise<void> => {
      const dto: UpdateItemDto = { name: 'Updated' };
      const updated: Item = { ...mockItem, name: 'Updated' };
      mockService.update.mockResolvedValue(updated);

      const result: Item = await controller.update('1', dto);

      expect(mockService.update).toHaveBeenCalledWith(1, dto);
      expect(result).toBe(updated);
    });

    it('should propagate NotFoundException when item does not exist', async (): Promise<void> => {
      mockService.update.mockRejectedValue(
        new NotFoundException('Item #99 not found')
      );

      await expect(controller.update('99', { name: 'X' })).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('remove', (): void => {
    it('should remove the item', async (): Promise<void> => {
      mockService.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(mockService.remove).toHaveBeenCalledWith(1);
    });

    it('should propagate NotFoundException when item does not exist', async (): Promise<void> => {
      mockService.remove.mockRejectedValue(
        new NotFoundException('Item #99 not found')
      );

      await expect(controller.remove('99')).rejects.toThrow(NotFoundException);
    });
  });
});
