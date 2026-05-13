import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { IsNull, Repository } from 'typeorm';
import { CitiesService } from './cities.service';
import { City } from './entities/city.entity';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';

const mockCity: City = {
  id: 1,
  name: 'Prague',
  archived_at: null,
};

const mockRepository: jest.Mocked<
  Pick<Repository<City>, 'create' | 'save' | 'find' | 'findOneBy' | 'remove'>
> = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
  remove: jest.fn(),
};

describe('CitiesService', (): void => {
  let service: CitiesService;

  beforeEach(async (): Promise<void> => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CitiesService,
        {
          provide: getRepositoryToken(City),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CitiesService>(CitiesService);
    jest.clearAllMocks();
  });

  describe('create', (): void => {
    it('should create and return a city', async (): Promise<void> => {
      const dto: CreateCityDto = { name: 'Prague' };
      mockRepository.create.mockReturnValue(mockCity);
      mockRepository.save.mockResolvedValue(mockCity);

      const result: City = await service.create(dto);

      expect(mockRepository.create).toHaveBeenCalledWith({
        name: 'Prague',
        archived_at: null,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockCity);
      expect(result).toEqual(mockCity);
    });
  });

  describe('findAll', (): void => {
    it('should return active cities', async (): Promise<void> => {
      const cities: City[] = [
        mockCity,
        { id: 2, name: 'Brno', archived_at: null },
      ];
      mockRepository.find.mockResolvedValue(cities);

      const result: City[] = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { archived_at: IsNull() },
      });
      expect(result).toEqual(cities);
    });

    it('should return empty array when no cities exist', async (): Promise<void> => {
      mockRepository.find.mockResolvedValue([]);

      const result: City[] = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', (): void => {
    it('should return a city by id', async (): Promise<void> => {
      mockRepository.findOneBy.mockResolvedValue(mockCity);

      const result: City = await service.findOne(1);

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({
        id: 1,
        archived_at: IsNull(),
      });
      expect(result).toEqual(mockCity);
    });

    it('should throw NotFoundException when city does not exist', async (): Promise<void> => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(99)).rejects.toThrow('City #99 not found');
    });
  });

  describe('update', (): void => {
    it('should update and return the city', async (): Promise<void> => {
      const dto: UpdateCityDto = { name: 'Updated Prague' };
      const updated: City = { ...mockCity, name: 'Updated Prague' };
      mockRepository.findOneBy.mockResolvedValue(mockCity);
      mockRepository.save.mockResolvedValue(updated);

      const result: City = await service.update(1, dto);

      expect(mockRepository.save).toHaveBeenCalledWith({
        ...mockCity,
        name: 'Updated Prague',
      });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException when city does not exist', async (): Promise<void> => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.update(99, { name: 'X' })).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('remove', (): void => {
    it('should archive the city', async (): Promise<void> => {
      mockRepository.findOneBy.mockResolvedValue(mockCity);
      mockRepository.save.mockResolvedValue({
        ...mockCity,
        archived_at: new Date(),
      });

      await service.remove(1);

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ archived_at: expect.any(Date) as Date })
      );
      expect(mockRepository.remove).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when city does not exist', async (): Promise<void> => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
