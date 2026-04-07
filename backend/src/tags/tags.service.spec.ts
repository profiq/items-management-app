import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TagsService } from './tags.service';
import { Tag } from './entities/tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

const mockTag: Tag = {
  id: 1,
  name: 'Fiction',
};

const mockRepository: jest.Mocked<
  Pick<Repository<Tag>, 'create' | 'save' | 'find' | 'findOneBy' | 'remove'>
> = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
  remove: jest.fn(),
};

describe('TagsService', (): void => {
  let service: TagsService;

  beforeEach(async (): Promise<void> => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagsService,
        {
          provide: getRepositoryToken(Tag),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TagsService>(TagsService);
    jest.clearAllMocks();
  });

  describe('create', (): void => {
    it('should create and return a tag', async (): Promise<void> => {
      const dto: CreateTagDto = { name: 'Fiction' };
      mockRepository.create.mockReturnValue(mockTag);
      mockRepository.save.mockResolvedValue(mockTag);

      const result: Tag = await service.create(dto);

      expect(mockRepository.create).toHaveBeenCalledWith(dto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockTag);
      expect(result).toEqual(mockTag);
    });
  });

  describe('findAll', (): void => {
    it('should return all tags', async (): Promise<void> => {
      const tags: Tag[] = [mockTag, { id: 2, name: 'Science' }];
      mockRepository.find.mockResolvedValue(tags);

      const result: Tag[] = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual(tags);
    });

    it('should return empty array when no tags exist', async (): Promise<void> => {
      mockRepository.find.mockResolvedValue([]);

      const result: Tag[] = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', (): void => {
    it('should return a tag by id', async (): Promise<void> => {
      mockRepository.findOneBy.mockResolvedValue(mockTag);

      const result: Tag = await service.findOne(1);

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(mockTag);
    });

    it('should throw NotFoundException when tag does not exist', async (): Promise<void> => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(99)).rejects.toThrow('Tag #99 not found');
    });
  });

  describe('update', (): void => {
    it('should update and return the tag', async (): Promise<void> => {
      const dto: UpdateTagDto = { name: 'Updated Fiction' };
      const updated: Tag = { ...mockTag, name: 'Updated Fiction' };
      mockRepository.findOneBy.mockResolvedValue(mockTag);
      mockRepository.save.mockResolvedValue(updated);

      const result: Tag = await service.update(1, dto);

      expect(mockRepository.save).toHaveBeenCalledWith({
        ...mockTag,
        name: 'Updated Fiction',
      });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException when tag does not exist', async (): Promise<void> => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.update(99, { name: 'X' })).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('remove', (): void => {
    it('should remove the tag', async (): Promise<void> => {
      mockRepository.findOneBy.mockResolvedValue(mockTag);
      mockRepository.remove.mockResolvedValue(mockTag);

      await service.remove(1);

      expect(mockRepository.remove).toHaveBeenCalledWith(mockTag);
    });

    it('should throw NotFoundException when tag does not exist', async (): Promise<void> => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
