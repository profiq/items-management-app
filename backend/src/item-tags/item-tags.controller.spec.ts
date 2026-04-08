import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ItemTagsController } from './item-tags.controller';
import { ItemTagsService } from './item-tags.service';
import { ItemTag } from './entities/item-tag.entity';
import { CreateItemTagDto } from './dto/create-item-tag.dto';

const mockItemTag: ItemTag = {
  item_id: 1,
  tag_id: 1,
  item: {
    id: 1,
    name: 'Clean Code',
    description: null,
    image_url: null,
    default_loan_days: 14,
    archived_at: null,
  },
  tag: { id: 1, name: 'Fiction' },
};

const mockService: jest.Mocked<
  Pick<ItemTagsService, 'create' | 'findAll' | 'findByItem' | 'remove'>
> = {
  create: jest.fn(),
  findAll: jest.fn(),
  findByItem: jest.fn(),
  remove: jest.fn(),
};

describe('ItemTagsController', (): void => {
  let controller: ItemTagsController;

  beforeEach(async (): Promise<void> => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemTagsController],
      providers: [
        {
          provide: ItemTagsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ItemTagsController>(ItemTagsController);
    jest.clearAllMocks();
  });

  describe('create', (): void => {
    it('should create and return an item-tag', async (): Promise<void> => {
      const dto: CreateItemTagDto = { item_id: 1, tag_id: 1 };
      mockService.create.mockResolvedValue(mockItemTag);

      const result: ItemTag = await controller.create(dto);

      expect(mockService.create).toHaveBeenCalledWith(dto);
      expect(result).toBe(mockItemTag);
    });

    it('should propagate ConflictException when relation already exists', async (): Promise<void> => {
      mockService.create.mockRejectedValue(new ConflictException());

      await expect(
        controller.create({ item_id: 1, tag_id: 1 })
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', (): void => {
    it('should return all item-tags', async (): Promise<void> => {
      mockService.findAll.mockResolvedValue([mockItemTag]);

      const result: ItemTag[] = await controller.findAll();

      expect(mockService.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockItemTag]);
    });
  });

  describe('findByItem', (): void => {
    it('should return tags for a given item', async (): Promise<void> => {
      mockService.findByItem.mockResolvedValue([mockItemTag]);

      const result: ItemTag[] = await controller.findByItem('1');

      expect(mockService.findByItem).toHaveBeenCalledWith(1);
      expect(result).toEqual([mockItemTag]);
    });
  });

  describe('remove', (): void => {
    it('should remove the item-tag relation', async (): Promise<void> => {
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
