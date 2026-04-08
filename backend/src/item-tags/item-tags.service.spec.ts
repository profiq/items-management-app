import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
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

const mockRepository: jest.Mocked<
  Pick<
    Repository<ItemTag>,
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

describe('ItemTagsService', (): void => {
  let service: ItemTagsService;

  beforeEach(async (): Promise<void> => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemTagsService,
        {
          provide: getRepositoryToken(ItemTag),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ItemTagsService>(ItemTagsService);
    jest.clearAllMocks();
  });

  describe('create', (): void => {
    it('should create and return an item-tag', async (): Promise<void> => {
      const dto: CreateItemTagDto = { item_id: 1, tag_id: 1 };
      mockRepository.findOneBy.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockItemTag);
      mockRepository.save.mockResolvedValue(mockItemTag);

      const result: ItemTag = await service.create(dto);

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({
        item_id: 1,
        tag_id: 1,
      });
      expect(mockRepository.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockItemTag);
    });

    it('should throw ConflictException when relation already exists', async (): Promise<void> => {
      mockRepository.findOneBy.mockResolvedValue(mockItemTag);

      await expect(service.create({ item_id: 1, tag_id: 1 })).rejects.toThrow(
        ConflictException
      );
    });
  });

  describe('findAll', (): void => {
    it('should return all item-tags', async (): Promise<void> => {
      mockRepository.find.mockResolvedValue([mockItemTag]);

      const result: ItemTag[] = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual([mockItemTag]);
    });
  });

  describe('findByItem', (): void => {
    it('should return tags for a given item', async (): Promise<void> => {
      mockRepository.findBy.mockResolvedValue([mockItemTag]);

      const result: ItemTag[] = await service.findByItem(1);

      expect(mockRepository.findBy).toHaveBeenCalledWith({ item_id: 1 });
      expect(result).toEqual([mockItemTag]);
    });

    it('should return empty array when item has no tags', async (): Promise<void> => {
      mockRepository.findBy.mockResolvedValue([]);

      const result: ItemTag[] = await service.findByItem(99);

      expect(result).toEqual([]);
    });
  });

  describe('remove', (): void => {
    it('should remove the item-tag relation', async (): Promise<void> => {
      mockRepository.findOneBy.mockResolvedValue(mockItemTag);
      mockRepository.remove.mockResolvedValue(mockItemTag);

      await service.remove(1, 1);

      expect(mockRepository.remove).toHaveBeenCalledWith(mockItemTag);
    });

    it('should throw NotFoundException when relation does not exist', async (): Promise<void> => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.remove(1, 99)).rejects.toThrow(NotFoundException);
    });
  });
});
