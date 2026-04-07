import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { LocationsService } from './locations.service';
import { Location } from './entities/location.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

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
      ],
    }).compile();

    service = module.get<LocationsService>(LocationsService);
    jest.clearAllMocks();
  });

  describe('create', (): void => {
    it('should create and return a location', async (): Promise<void> => {
      const dto: CreateLocationDto = { name: 'Central Library', city_id: 1 };
      mockRepository.create.mockReturnValue(mockLocation);
      mockRepository.save.mockResolvedValue(mockLocation);

      const result: Location = await service.create(dto);

      expect(mockRepository.create).toHaveBeenCalledWith({
        name: 'Central Library',
        city_id: 1,
        archived_at: null,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockLocation);
      expect(result).toEqual(mockLocation);
    });
  });

  describe('findAll', (): void => {
    it('should return all locations', async (): Promise<void> => {
      const locations: Location[] = [mockLocation];
      mockRepository.find.mockResolvedValue(locations);

      const result: Location[] = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
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

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
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

    it('should throw NotFoundException when location does not exist', async (): Promise<void> => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.update(99, { name: 'X' })).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('remove', (): void => {
    it('should remove the location', async (): Promise<void> => {
      mockRepository.findOneBy.mockResolvedValue(mockLocation);
      mockRepository.remove.mockResolvedValue(mockLocation);

      await service.remove(1);

      expect(mockRepository.remove).toHaveBeenCalledWith(mockLocation);
    });

    it('should throw NotFoundException when location does not exist', async (): Promise<void> => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
