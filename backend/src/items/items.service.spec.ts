import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
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

const mockRepository: jest.Mocked<
  Pick<Repository<Item>, 'create' | 'save' | 'find' | 'findOneBy' | 'remove'>
> = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
  remove: jest.fn(),
};

describe('ItemsService', (): void => {
  let service: ItemsService;

  beforeEach(async (): Promise<void> => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemsService,
        {
          provide: getRepositoryToken(Item),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ItemsService>(ItemsService);
    jest.clearAllMocks();
  });

  describe('create', (): void => {
    it('should create and return an item', async (): Promise<void> => {
      const dto: CreateItemDto = {
        name: 'Clean Code',
        description: 'A book about clean code',
        default_loan_days: 14,
      };
      mockRepository.create.mockReturnValue(mockItem);
      mockRepository.save.mockResolvedValue(mockItem);

      const result: Item = await service.create(dto);

      expect(mockRepository.create).toHaveBeenCalledWith({
        name: 'Clean Code',
        description: 'A book about clean code',
        image_url: null,
        default_loan_days: 14,
        archived_at: null,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockItem);
      expect(result).toEqual(mockItem);
    });

    it('should default description and image_url to null when not provided', async (): Promise<void> => {
      const dto: CreateItemDto = { name: 'Clean Code', default_loan_days: 14 };
      mockRepository.create.mockReturnValue(mockItem);
      mockRepository.save.mockResolvedValue(mockItem);

      await service.create(dto);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ description: null, image_url: null })
      );
    });
  });

  describe('findAll', (): void => {
    it('should return all items', async (): Promise<void> => {
      const items: Item[] = [mockItem];
      mockRepository.find.mockResolvedValue(items);

      const result: Item[] = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual(items);
    });

    it('should return empty array when no items exist', async (): Promise<void> => {
      mockRepository.find.mockResolvedValue([]);

      const result: Item[] = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', (): void => {
    it('should return an item by id', async (): Promise<void> => {
      mockRepository.findOneBy.mockResolvedValue(mockItem);

      const result: Item = await service.findOne(1);

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(mockItem);
    });

    it('should throw NotFoundException when item does not exist', async (): Promise<void> => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(99)).rejects.toThrow('Item #99 not found');
    });
  });

  describe('update', (): void => {
    it('should update and return the item', async (): Promise<void> => {
      const dto: UpdateItemDto = { name: 'Updated Code', default_loan_days: 7 };
      const updated: Item = {
        ...mockItem,
        name: 'Updated Code',
        default_loan_days: 7,
      };
      mockRepository.findOneBy.mockResolvedValue(mockItem);
      mockRepository.save.mockResolvedValue(updated);

      const result: Item = await service.update(1, dto);

      expect(mockRepository.save).toHaveBeenCalledWith({
        ...mockItem,
        name: 'Updated Code',
        default_loan_days: 7,
      });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException when item does not exist', async (): Promise<void> => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.update(99, { name: 'X' })).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('remove', (): void => {
    it('should remove the item', async (): Promise<void> => {
      mockRepository.findOneBy.mockResolvedValue(mockItem);
      mockRepository.remove.mockResolvedValue(mockItem);

      await service.remove(1);

      expect(mockRepository.remove).toHaveBeenCalledWith(mockItem);
    });

    it('should throw NotFoundException when item does not exist', async (): Promise<void> => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
