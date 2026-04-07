import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ItemCopiesService } from './item-copies.service';
import { ItemCopy } from './entities/item-copy.entity';
import { CreateItemCopyDto } from './dto/create-item-copy.dto';
import { UpdateItemCopyDto } from './dto/update-item-copy.dto';

const mockItemCopy: ItemCopy = {
  id: 1,
  item: {
    id: 1,
    name: 'Clean Code',
    description: null,
    image_url: null,
    default_loan_days: 14,
    archived_at: null,
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

const mockRepository: jest.Mocked<
  Pick<
    Repository<ItemCopy>,
    'create' | 'save' | 'find' | 'findOneBy' | 'remove'
  >
> = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
  remove: jest.fn(),
};

describe('ItemCopiesService', (): void => {
  let service: ItemCopiesService;

  beforeEach(async (): Promise<void> => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemCopiesService,
        {
          provide: getRepositoryToken(ItemCopy),
          useValue: mockRepository,
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
        condition: 'good',
      };
      mockRepository.create.mockReturnValue(mockItemCopy);
      mockRepository.save.mockResolvedValue(mockItemCopy);

      const result: ItemCopy = await service.create(dto);

      expect(mockRepository.create).toHaveBeenCalledWith({
        item_id: 1,
        location_id: 1,
        condition: 'good',
        archived_at: null,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockItemCopy);
      expect(result).toEqual(mockItemCopy);
    });

    it('should default condition to null when not provided', async (): Promise<void> => {
      const dto: CreateItemCopyDto = { item_id: 1, location_id: 1 };
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

    it('should return empty array when no item copies exist', async (): Promise<void> => {
      mockRepository.find.mockResolvedValue([]);

      const result: ItemCopy[] = await service.findAll();

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
      const dto: UpdateItemCopyDto = { condition: 'damaged' };
      const updated: ItemCopy = { ...mockItemCopy, condition: 'damaged' };
      mockRepository.findOneBy.mockResolvedValue(mockItemCopy);
      mockRepository.save.mockResolvedValue(updated);

      const result: ItemCopy = await service.update(1, dto);

      expect(mockRepository.save).toHaveBeenCalledWith({
        ...mockItemCopy,
        condition: 'damaged',
      });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException when item copy does not exist', async (): Promise<void> => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.update(99, { condition: 'damaged' })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', (): void => {
    it('should remove the item copy', async (): Promise<void> => {
      mockRepository.findOneBy.mockResolvedValue(mockItemCopy);
      mockRepository.remove.mockResolvedValue(mockItemCopy);

      await service.remove(1);

      expect(mockRepository.remove).toHaveBeenCalledWith(mockItemCopy);
    });

    it('should throw NotFoundException when item copy does not exist', async (): Promise<void> => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
