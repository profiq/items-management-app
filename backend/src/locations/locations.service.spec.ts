import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { IsNull, Repository } from 'typeorm';
import { LocationsService } from './locations.service';
import { Location } from './entities/location.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { City } from '@/cities/entities/city.entity';

const mockCity = { id: 1, name: 'Prague', archived_at: null };

const mockLocation: Location = {
  id: 1,
  name: 'Central Library',
  city: mockCity,
  city_id: 1,
  archived_at: null,
};

const mockRepository: jest.Mocked<
  Pick<
    Repository<Location>,
    'create' | 'save' | 'find' | 'findOneBy' | 'remove'
  >
> = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
  remove: jest.fn(),
};

const mockCityRepository: jest.Mocked<Pick<Repository<City>, 'findOneBy'>> = {
  findOneBy: jest.fn(),
};

describe('LocationsService', (): void => {
  let service: LocationsService;

  beforeEach(async (): Promise<void> => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationsService,
        {
          provide: getRepositoryToken(Location),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(City),
          useValue: mockCityRepository,
        },
      ],
    }).compile();

    service = module.get<LocationsService>(LocationsService);
    jest.clearAllMocks();
  });

  describe('create', (): void => {
    it('should create and return a location', async (): Promise<void> => {
      const dto: CreateLocationDto = { name: 'Central Library', city_id: 1 };
      mockCityRepository.findOneBy.mockResolvedValue(mockCity);
      mockRepository.create.mockReturnValue(mockLocation);
      mockRepository.save.mockResolvedValue(mockLocation);

      const result: Location = await service.create(dto);

      expect(mockCityRepository.findOneBy).toHaveBeenCalledWith({
        id: 1,
        archived_at: IsNull(),
      });
      expect(mockRepository.create).toHaveBeenCalledWith({
        name: 'Central Library',
        city_id: 1,
        archived_at: null,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockLocation);
      expect(result).toEqual(mockLocation);
    });

    it('should reject archived or missing city', async (): Promise<void> => {
      mockCityRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.create({ name: 'Central Library', city_id: 99 })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', (): void => {
    it('should return active locations', async (): Promise<void> => {
      const locations: Location[] = [mockLocation];
      mockRepository.find.mockResolvedValue(locations);

      const result: Location[] = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { archived_at: IsNull() },
      });
      expect(result).toEqual(locations);
    });

    it('should return empty array when no locations exist', async (): Promise<void> => {
      mockRepository.find.mockResolvedValue([]);

      const result: Location[] = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', (): void => {
    it('should return a location by id', async (): Promise<void> => {
      mockRepository.findOneBy.mockResolvedValue(mockLocation);

      const result: Location = await service.findOne(1);

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({
        id: 1,
        archived_at: IsNull(),
      });
      expect(result).toEqual(mockLocation);
    });

    it('should throw NotFoundException when location does not exist', async (): Promise<void> => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(99)).rejects.toThrow(
        'Location #99 not found'
      );
    });
  });

  describe('update', (): void => {
    it('should update and return the location', async (): Promise<void> => {
      const dto: UpdateLocationDto = { name: 'Updated Library' };
      const updated: Location = { ...mockLocation, name: 'Updated Library' };
      mockRepository.findOneBy.mockResolvedValue(mockLocation);
      mockRepository.save.mockResolvedValue(updated);

      const result: Location = await service.update(1, dto);

      expect(mockRepository.save).toHaveBeenCalledWith({
        ...mockLocation,
        name: 'Updated Library',
      });
      expect(result).toEqual(updated);
    });

    it('should reject archived or missing city on city reassignment', async (): Promise<void> => {
      mockRepository.findOneBy.mockResolvedValue(mockLocation);
      mockCityRepository.findOneBy.mockResolvedValue(null);

      await expect(service.update(1, { city_id: 99 })).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw NotFoundException when location does not exist', async (): Promise<void> => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.update(99, { name: 'X' })).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('remove', (): void => {
    it('should archive the location', async (): Promise<void> => {
      mockRepository.findOneBy.mockResolvedValue(mockLocation);
      mockRepository.save.mockResolvedValue({
        ...mockLocation,
        archived_at: new Date(),
      });

      await service.remove(1);

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ archived_at: expect.any(Date) as Date })
      );
      expect(mockRepository.remove).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when location does not exist', async (): Promise<void> => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
