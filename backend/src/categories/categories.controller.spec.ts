import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

const mockCategory: Category = {
  id: 1,
  name: 'Electronics',
  archived_at: null,
};

const mockService: jest.Mocked<
  Pick<
    CategoriesService,
    'create' | 'findAll' | 'findOne' | 'update' | 'remove'
  >
> = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('CategoriesController', (): void => {
  let controller: CategoriesController;

  beforeEach(async (): Promise<void> => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    jest.clearAllMocks();
  });

  it('should be defined', (): void => {
    expect(controller).toBeDefined();
  });

  describe('create', (): void => {
    it('should create and return a category', async (): Promise<void> => {
      const dto: CreateCategoryDto = { name: 'Electronics' };
      mockService.create.mockResolvedValue(mockCategory);

      const result: Category = await controller.create(dto);

      expect(mockService.create).toHaveBeenCalledWith(dto);
      expect(result).toBe(mockCategory);
    });
  });

  describe('findAll', (): void => {
    it('should return all categories', async (): Promise<void> => {
      mockService.findAll.mockResolvedValue([mockCategory]);

      const result: Category[] = await controller.findAll();

      expect(mockService.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockCategory]);
    });

    it('should return empty array when no categories exist', async (): Promise<void> => {
      mockService.findAll.mockResolvedValue([]);

      const result: Category[] = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', (): void => {
    it('should return a category by id', async (): Promise<void> => {
      mockService.findOne.mockResolvedValue(mockCategory);

      const result: Category = await controller.findOne('1');

      expect(mockService.findOne).toHaveBeenCalledWith(1);
      expect(result).toBe(mockCategory);
    });

    it('should propagate NotFoundException when category does not exist', async (): Promise<void> => {
      mockService.findOne.mockRejectedValue(new Error('Not found'));

      await expect(controller.findOne('99')).rejects.toThrow('Not found');
    });
  });

  describe('update', (): void => {
    it('should update and return a category', async (): Promise<void> => {
      const dto: UpdateCategoryDto = { name: 'Updated' };
      const updated: Category = { ...mockCategory, name: 'Updated' };
      mockService.update.mockResolvedValue(updated);

      const result: Category = await controller.update('1', dto);

      expect(mockService.update).toHaveBeenCalledWith(1, dto);
      expect(result).toBe(updated);
    });
  });

  describe('remove', (): void => {
    it('should remove a category', async (): Promise<void> => {
      mockService.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(mockService.remove).toHaveBeenCalledWith(1);
    });
  });
});
