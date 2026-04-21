import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ItemCopiesAdminController } from './item-copies.admin.controller';
import { ItemCopiesService } from '@/item-copies/item-copies.service';
import { AuthGuard } from '@/auth/auth.guard';
import { RolesGuard } from '@/auth/roles.guard';
import {
  ItemCopy,
  ItemCondition,
} from '@/item-copies/entities/item-copy.entity';
import { UpdateItemCopyBodyDto } from '@/item-copies/dto/update-item-copy-body.dto';
import { ItemCopyResponseDto } from '@/item-copies/dto/item-copy-response.dto';

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
  condition: ItemCondition.Good,
  archived_at: null,
};

const mockService: jest.Mocked<
  Pick<ItemCopiesService, 'create' | 'findOne' | 'update' | 'archive'>
> = {
  create: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  archive: jest.fn(),
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
    it('should create an item copy with itemId from route param', async (): Promise<void> => {
      mockService.create.mockResolvedValue(mockItemCopy);

      const result: ItemCopyResponseDto = await controller.create(1, {
        location_id: 1,
        condition: ItemCondition.Good,
      });

      expect(mockService.create).toHaveBeenCalledWith({
        item_id: 1,
        location_id: 1,
        condition: ItemCondition.Good,
      });
      expect(result).toBe(mockItemCopy);
    });
  });

  describe('update', (): void => {
    it('should update and return the item copy', async (): Promise<void> => {
      const dto: UpdateItemCopyBodyDto = { condition: ItemCondition.Damaged };
      const updated: ItemCopy = {
        ...mockItemCopy,
        condition: ItemCondition.Damaged,
      };
      mockService.findOne.mockResolvedValue(mockItemCopy);
      mockService.update.mockResolvedValue(updated);

      const result: ItemCopyResponseDto = await controller.update(1, 1, dto);

      expect(mockService.findOne).toHaveBeenCalledWith(1);
      expect(mockService.update).toHaveBeenCalledWith(1, dto);
      expect(result).toBe(updated);
    });

    it('should throw NotFoundException when copy belongs to a different item', async (): Promise<void> => {
      mockService.findOne.mockResolvedValue({ ...mockItemCopy, item_id: 99 });

      await expect(
        controller.update(1, 1, { condition: ItemCondition.Damaged })
      ).rejects.toThrow(NotFoundException);
      expect(mockService.update).not.toHaveBeenCalled();
    });

    it('should propagate NotFoundException when item copy does not exist', async (): Promise<void> => {
      mockService.findOne.mockRejectedValue(
        new NotFoundException('ItemCopy #99 not found')
      );

      await expect(
        controller.update(1, 99, { condition: ItemCondition.Damaged })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('archive', (): void => {
    it('should archive the item copy', async (): Promise<void> => {
      const archived: ItemCopy = { ...mockItemCopy, archived_at: new Date() };
      mockService.findOne.mockResolvedValue(mockItemCopy);
      mockService.archive.mockResolvedValue(archived);

      const result: ItemCopyResponseDto = await controller.archive(1, 1);

      expect(mockService.findOne).toHaveBeenCalledWith(1);
      expect(mockService.archive).toHaveBeenCalledWith(1);
      expect(result.archived_at).not.toBeNull();
    });

    it('should throw NotFoundException when copy belongs to a different item', async (): Promise<void> => {
      mockService.findOne.mockResolvedValue({ ...mockItemCopy, item_id: 99 });

      await expect(controller.archive(1, 1)).rejects.toThrow(NotFoundException);
      expect(mockService.archive).not.toHaveBeenCalled();
    });

    it('should propagate NotFoundException when item copy does not exist', async (): Promise<void> => {
      mockService.findOne.mockRejectedValue(
        new NotFoundException('ItemCopy #99 not found')
      );

      await expect(controller.archive(1, 99)).rejects.toThrow(
        NotFoundException
      );
    });
  });
});
