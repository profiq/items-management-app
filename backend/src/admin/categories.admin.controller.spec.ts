import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CategoriesAdminController } from './categories.admin.controller';
import { CategoriesService } from '@/categories/categories.service';
import { AuthGuard } from '@/auth/auth.guard';
import { RolesGuard } from '@/auth/roles.guard';
import { Category } from '@/categories/entities/category.entity';
import { CreateCategoryDto } from '@/categories/dto/create-category.dto';
import { UpdateCategoryDto } from '@/categories/dto/update-category.dto';

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

describe('CategoriesAdminController', (): void => {
  let controller: CategoriesAdminController;

  beforeEach(async (): Promise<void> => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesAdminController],
      providers: [{ provide: CategoriesService, useValue: mockService }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CategoriesAdminController>(
      CategoriesAdminController
    );
    jest.clearAllMocks();
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
  });

  describe('findOne', (): void => {
    it('should return a category by id', async (): Promise<void> => {
      mockService.findOne.mockResolvedValue(mockCategory);

      const result: Category = await controller.findOne(1);

      expect(mockService.findOne).toHaveBeenCalledWith(1);
      expect(result).toBe(mockCategory);
    });

    it('should propagate NotFoundException when category does not exist', async (): Promise<void> => {
      mockService.findOne.mockRejectedValue(
        new NotFoundException('Category #99 not found')
      );

      await expect(controller.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', (): void => {
    it('should update and return a category', async (): Promise<void> => {
      const dto: UpdateCategoryDto = { name: 'Updated' };
      const updated: Category = { ...mockCategory, name: 'Updated' };
      mockService.update.mockResolvedValue(updated);

      const result: Category = await controller.update(1, dto);

      expect(mockService.update).toHaveBeenCalledWith(1, dto);
      expect(result).toBe(updated);
    });

    it('should propagate NotFoundException when category does not exist', async (): Promise<void> => {
      mockService.update.mockRejectedValue(
        new NotFoundException('Category #99 not found')
      );

      await expect(controller.update(99, { name: 'X' })).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('remove', (): void => {
    it('should remove a category', async (): Promise<void> => {
      mockService.remove.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(mockService.remove).toHaveBeenCalledWith(1);
    });

    it('should propagate NotFoundException when category does not exist', async (): Promise<void> => {
      mockService.remove.mockRejectedValue(
        new NotFoundException('Category #99 not found')
      );

      await expect(controller.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
