import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TagsController } from './tags.controller';
import { TagsService } from './tags.service';
import { Tag } from './entities/tag.entity';

const mockTag: Tag = {
  id: 1,
  name: 'Fiction',
};

const mockService: jest.Mocked<Pick<TagsService, 'findAll' | 'findOne'>> = {
  findAll: jest.fn(),
  findOne: jest.fn(),
};

describe('TagsController', (): void => {
  let controller: TagsController;

  beforeEach(async (): Promise<void> => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TagsController],
      providers: [
        {
          provide: TagsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<TagsController>(TagsController);
    jest.clearAllMocks();
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
});
