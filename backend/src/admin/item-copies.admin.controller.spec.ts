import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ItemCopiesAdminController } from './item-copies.admin.controller';
import { ItemCopiesService } from '@/item-copies/item-copies.service';
import { AuthGuard } from '@/auth/auth.guard';
import { RolesGuard } from '@/auth/roles.guard';
import { ItemCopy } from '@/item-copies/entities/item-copy.entity';
import { CreateItemCopyDto } from '@/item-copies/dto/create-item-copy.dto';
import { UpdateItemCopyDto } from '@/item-copies/dto/update-item-copy.dto';

const mockItemCopy: ItemCopy = {
  id: 1,
  item: {
    id: 1,
    name: 'Clean Code',
    description: null,
    image_url: null,
    default_loan_days: 14,
    archived_at: null,
    categories: [],
    tags: [],
  },
  item_id: 1,
  location: {
    id: 1,
    name: 'Central Library',
    city: { id: 1, name: 'Prague', archived_at: null },
    city_id: 1,
    archived_at: null,
  },
  location_id: 1,
  condition: 'good',
  archived_at: null,
};

const mockService: jest.Mocked<
  Pick<
    ItemCopiesService,
    'create' | 'findAll' | 'findOne' | 'update' | 'remove'
  >
> = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('ItemCopiesAdminController', (): void => {
  let controller: ItemCopiesAdminController;

  beforeEach(async (): Promise<void> => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemCopiesAdminController],
      providers: [{ provide: ItemCopiesService, useValue: mockService }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ItemCopiesAdminController>(
      ItemCopiesAdminController
    );
    jest.clearAllMocks();
  });

  describe('create', (): void => {
    it('should create and return an item copy', async (): Promise<void> => {
      const dto: CreateItemCopyDto = {
        item_id: 1,
        location_id: 1,
        condition: 'good',
      };
      mockService.create.mockResolvedValue(mockItemCopy);

      const result: ItemCopy = await controller.create(dto);

      expect(mockService.create).toHaveBeenCalledWith(dto);
      expect(result).toBe(mockItemCopy);
    });
  });

  describe('findAll', (): void => {
    it('should return all item copies', async (): Promise<void> => {
      const copies: ItemCopy[] = [mockItemCopy];
      mockService.findAll.mockResolvedValue(copies);

      const result: ItemCopy[] = await controller.findAll();

      expect(mockService.findAll).toHaveBeenCalled();
      expect(result).toBe(copies);
    });
  });

  describe('findOne', (): void => {
    it('should return an item copy by id', async (): Promise<void> => {
      mockService.findOne.mockResolvedValue(mockItemCopy);

      const result: ItemCopy = await controller.findOne(1);

      expect(mockService.findOne).toHaveBeenCalledWith(1);
      expect(result).toBe(mockItemCopy);
    });

    it('should propagate NotFoundException when item copy does not exist', async (): Promise<void> => {
      mockService.findOne.mockRejectedValue(
        new NotFoundException('ItemCopy #99 not found')
      );

      await expect(controller.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', (): void => {
    it('should update and return the item copy', async (): Promise<void> => {
      const dto: UpdateItemCopyDto = { condition: 'damaged' };
      const updated: ItemCopy = { ...mockItemCopy, condition: 'damaged' };
      mockService.update.mockResolvedValue(updated);

      const result: ItemCopy = await controller.update(1, dto);

      expect(mockService.update).toHaveBeenCalledWith(1, dto);
      expect(result).toBe(updated);
    });

    it('should propagate NotFoundException when item copy does not exist', async (): Promise<void> => {
      mockService.update.mockRejectedValue(
        new NotFoundException('ItemCopy #99 not found')
      );

      await expect(
        controller.update(99, { condition: 'damaged' })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', (): void => {
    it('should remove the item copy', async (): Promise<void> => {
      mockService.remove.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(mockService.remove).toHaveBeenCalledWith(1);
    });

    it('should propagate NotFoundException when item copy does not exist', async (): Promise<void> => {
      mockService.remove.mockRejectedValue(
        new NotFoundException('ItemCopy #99 not found')
      );

      await expect(controller.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
