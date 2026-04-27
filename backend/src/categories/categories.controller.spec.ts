import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';

const mockCategory: Category = {
  id: 1,
  name: 'Electronics',
  archived_at: null,
};

const mockService: jest.Mocked<Pick<CategoriesService, 'findAll' | 'findOne'>> =
  {
    findAll: jest.fn(),
    findOne: jest.fn(),
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
});
