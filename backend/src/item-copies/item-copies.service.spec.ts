import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { IsNull, Repository } from 'typeorm';
import { ItemCopiesService } from './item-copies.service';
import { ItemCopy, ItemCondition } from './entities/item-copy.entity';
import { CreateItemCopyDto } from './dto/create-item-copy.dto';
import { UpdateItemCopyDto } from './dto/update-item-copy.dto';
import { Item } from '@/items/entities/item.entity';
import { Location } from '@/locations/entities/location.entity';

const mockItem: Item = {
  id: 1,
  name: 'Clean Code',
  description: null,
  image_url: null,
  default_loan_days: 14,
  archived_at: null,
  categories: [],
  tags: [],
};

const mockLocation: Location = {
  id: 1,
  name: 'Central Library',
  city: { id: 1, name: 'Prague', archived_at: null },
  city_id: 1,
  archived_at: null,
};

const mockItemCopy: ItemCopy = {
  id: 1,
  item: mockItem,
  item_id: 1,
  location: mockLocation,
  location_id: 1,
  condition: ItemCondition.Good,
  archived_at: null,
};

const mockRepository: jest.Mocked<
  Pick<Repository<ItemCopy>, 'create' | 'save' | 'find' | 'findOneBy'>
> = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
};

const mockItemRepository: jest.Mocked<Pick<Repository<Item>, 'findOneBy'>> = {
  findOneBy: jest.fn(),
};

const mockLocationRepository: jest.Mocked<
  Pick<Repository<Location>, 'findOneBy'>
> = {
  findOneBy: jest.fn(),
};

describe('ItemCopiesService', (): void => {
  let service: ItemCopiesService;

  beforeEach(async (): Promise<void> => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemCopiesService,
        { provide: getRepositoryToken(ItemCopy), useValue: mockRepository },
        { provide: getRepositoryToken(Item), useValue: mockItemRepository },
        {
          provide: getRepositoryToken(Location),
          useValue: mockLocationRepository,
        },
      ],
    }).compile();

    service = module.get<ItemCopiesService>(ItemCopiesService);
    jest.clearAllMocks();
  });

  describe('create', (): void => {
    it('should create and return an item copy', async (): Promise<void> => {
      const dto: CreateItemCopyDto = {
        item_id: 1,
        location_id: 1,
        condition: ItemCondition.Good,
      };
      mockItemRepository.findOneBy.mockResolvedValue(mockItem);
      mockLocationRepository.findOneBy.mockResolvedValue(mockLocation);
      mockRepository.create.mockReturnValue(mockItemCopy);
      mockRepository.save.mockResolvedValue(mockItemCopy);

      const result: ItemCopy = await service.create(dto);

      expect(mockItemRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(mockLocationRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(mockRepository.create).toHaveBeenCalledWith({
        item_id: 1,
        location_id: 1,
        condition: ItemCondition.Good,
        archived_at: null,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockItemCopy);
      expect(result).toEqual(mockItemCopy);
    });

    it('should default condition to null when not provided', async (): Promise<void> => {
      const dto: CreateItemCopyDto = { item_id: 1, location_id: 1 };
      mockItemRepository.findOneBy.mockResolvedValue(mockItem);
      mockLocationRepository.findOneBy.mockResolvedValue(mockLocation);
      mockRepository.create.mockReturnValue(mockItemCopy);
      mockRepository.save.mockResolvedValue(mockItemCopy);

      await service.create(dto);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ condition: null })
      );
    });
  });

  describe('findAll', (): void => {
    it('should return all item copies', async (): Promise<void> => {
      const copies: ItemCopy[] = [mockItemCopy];
      mockRepository.find.mockResolvedValue(copies);

      const result: ItemCopy[] = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual(copies);
    });
  });

  describe('findByItemId', (): void => {
    it('should return copies for a given item', async (): Promise<void> => {
      const copies: ItemCopy[] = [mockItemCopy];
      mockRepository.find.mockResolvedValue(copies);

      const result: ItemCopy[] = await service.findByItemId(1);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { item_id: 1, archived_at: IsNull() },
        relations: ['location'],
      });
      expect(result).toEqual(copies);
    });

    it('should return empty array when item has no copies', async (): Promise<void> => {
      mockRepository.find.mockResolvedValue([]);

      const result: ItemCopy[] = await service.findByItemId(99);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', (): void => {
    it('should return an item copy by id', async (): Promise<void> => {
      mockRepository.findOneBy.mockResolvedValue(mockItemCopy);

      const result: ItemCopy = await service.findOne(1);

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(mockItemCopy);
    });

    it('should throw NotFoundException when item copy does not exist', async (): Promise<void> => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(99)).rejects.toThrow(
        'ItemCopy #99 not found'
      );
    });
  });

  describe('update', (): void => {
    it('should update and return the item copy', async (): Promise<void> => {
      const dto: UpdateItemCopyDto = { condition: ItemCondition.Damaged };
      const updated: ItemCopy = {
        ...mockItemCopy,
        condition: ItemCondition.Damaged,
      };
      mockRepository.findOneBy.mockResolvedValue(mockItemCopy);
      mockRepository.save.mockResolvedValue(updated);

      const result: ItemCopy = await service.update(1, dto);

      expect(mockRepository.save).toHaveBeenCalledWith({
        ...mockItemCopy,
        condition: ItemCondition.Damaged,
      });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException when item copy does not exist', async (): Promise<void> => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.update(99, { condition: ItemCondition.Damaged })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('archive', (): void => {
    it('should set archived_at and return the item copy', async (): Promise<void> => {
      const archived: ItemCopy = { ...mockItemCopy, archived_at: new Date() };
      mockRepository.findOneBy.mockResolvedValue(mockItemCopy);
      mockRepository.save.mockResolvedValue(archived);

      const result: ItemCopy = await service.archive(1);

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ archived_at: expect.any(Date) as Date })
      );
      expect(result.archived_at).not.toBeNull();
    });

    it('should throw NotFoundException when item copy does not exist', async (): Promise<void> => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.archive(99)).rejects.toThrow(NotFoundException);
    });
  });
});
