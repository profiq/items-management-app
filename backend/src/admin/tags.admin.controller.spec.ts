import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TagsAdminController } from './tags.admin.controller';
import { TagsService } from '@/tags/tags.service';
import { AuthGuard } from '@/auth/auth.guard';
import { RolesGuard } from '@/auth/roles.guard';
import { Tag } from '@/tags/entities/tag.entity';
import { CreateTagDto } from '@/tags/dto/create-tag.dto';
import { UpdateTagDto } from '@/tags/dto/update-tag.dto';

const mockTag: Tag = {
  id: 1,
  name: 'Fiction',
};

const mockService: jest.Mocked<
  Pick<TagsService, 'create' | 'findAll' | 'findOne' | 'update' | 'remove'>
> = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('TagsAdminController', (): void => {
  let controller: TagsAdminController;

  beforeEach(async (): Promise<void> => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TagsAdminController],
      providers: [{ provide: TagsService, useValue: mockService }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TagsAdminController>(TagsAdminController);
    jest.clearAllMocks();
  });

  describe('create', (): void => {
    it('should create and return a tag', async (): Promise<void> => {
      const dto: CreateTagDto = { name: 'Fiction' };
      mockService.create.mockResolvedValue(mockTag);

      const result: Tag = await controller.create(dto);

      expect(mockService.create).toHaveBeenCalledWith(dto);
      expect(result).toBe(mockTag);
    });
  });

  describe('findAll', (): void => {
    it('should return all tags', async (): Promise<void> => {
      const tags: Tag[] = [mockTag];
      mockService.findAll.mockResolvedValue(tags);

      const result: Tag[] = await controller.findAll();

      expect(mockService.findAll).toHaveBeenCalled();
      expect(result).toBe(tags);
    });
  });

  describe('findOne', (): void => {
    it('should return a tag by id', async (): Promise<void> => {
      mockService.findOne.mockResolvedValue(mockTag);

      const result: Tag = await controller.findOne('1');

      expect(mockService.findOne).toHaveBeenCalledWith(1);
      expect(result).toBe(mockTag);
    });

    it('should propagate NotFoundException when tag does not exist', async (): Promise<void> => {
      mockService.findOne.mockRejectedValue(
        new NotFoundException('Tag #99 not found')
      );

      await expect(controller.findOne('99')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', (): void => {
    it('should update and return the tag', async (): Promise<void> => {
      const dto: UpdateTagDto = { name: 'Updated' };
      const updated: Tag = { ...mockTag, name: 'Updated' };
      mockService.update.mockResolvedValue(updated);

      const result: Tag = await controller.update('1', dto);

      expect(mockService.update).toHaveBeenCalledWith(1, dto);
      expect(result).toBe(updated);
    });

    it('should propagate NotFoundException when tag does not exist', async (): Promise<void> => {
      mockService.update.mockRejectedValue(
        new NotFoundException('Tag #99 not found')
      );

      await expect(controller.update('99', { name: 'X' })).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('remove', (): void => {
    it('should remove the tag', async (): Promise<void> => {
      mockService.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(mockService.remove).toHaveBeenCalledWith(1);
    });

    it('should propagate NotFoundException when tag does not exist', async (): Promise<void> => {
      mockService.remove.mockRejectedValue(
        new NotFoundException('Tag #99 not found')
      );

      await expect(controller.remove('99')).rejects.toThrow(NotFoundException);
    });
  });
});
