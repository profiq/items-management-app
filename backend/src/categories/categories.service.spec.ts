import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

const mockCategory: Category = {
  id: 1,
  name: 'Electronics',
  archived_at: null,
};

const mockRepository: jest.Mocked<
  Pick<
    Repository<Category>,
    'create' | 'save' | 'find' | 'findOneBy' | 'remove'
  >
> = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
  remove: jest.fn(),
};

describe('CategoriesService', (): void => {
  let service: CategoriesService;

  beforeEach(async (): Promise<void> => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    jest.clearAllMocks();
  });

  it('should be defined', (): void => {
    expect(service).toBeDefined();
  });

  describe('create', (): void => {
    it('should create and return a category', async (): Promise<void> => {
      const dto: CreateCategoryDto = { name: 'Electronics' };
      mockRepository.create.mockReturnValue(mockCategory);
      mockRepository.save.mockResolvedValue(mockCategory);

      const result: Category = await service.create(dto);

      expect(mockRepository.create).toHaveBeenCalledWith({
        name: 'Electronics',
        archived_at: null,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockCategory);
      expect(result).toEqual(mockCategory);
    });
  });

  describe('findAll', (): void => {
    it('should return all categories', async (): Promise<void> => {
      mockRepository.find.mockResolvedValue([mockCategory]);

      const result: Category[] = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual([mockCategory]);
    });

    it('should return empty array when no categories exist', async (): Promise<void> => {
      mockRepository.find.mockResolvedValue([]);

      const result: Category[] = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', (): void => {
    it('should return a category by id', async (): Promise<void> => {
      mockRepository.findOneBy.mockResolvedValue(mockCategory);

      const result: Category = await service.findOne(1);

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(mockCategory);
    });

    it('should throw NotFoundException when category does not exist', async (): Promise<void> => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', (): void => {
    it('should update and return the category', async (): Promise<void> => {
      const dto: UpdateCategoryDto = { name: 'Updated' };
      const updated: Category = { ...mockCategory, name: 'Updated' };
      mockRepository.findOneBy.mockResolvedValue({ ...mockCategory });
      mockRepository.save.mockResolvedValue(updated);

      const result: Category = await service.update(1, dto);

      expect(mockRepository.save).toHaveBeenCalled();
      expect(result.name).toBe('Updated');
    });

    it('should throw NotFoundException when category does not exist', async (): Promise<void> => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.update(99, { name: 'Updated' })).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('remove', (): void => {
    it('should remove the category', async (): Promise<void> => {
      mockRepository.findOneBy.mockResolvedValue(mockCategory);
      mockRepository.remove.mockResolvedValue(mockCategory);

      await service.remove(1);

      expect(mockRepository.remove).toHaveBeenCalledWith(mockCategory);
    });

    it('should throw NotFoundException when category does not exist', async (): Promise<void> => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
