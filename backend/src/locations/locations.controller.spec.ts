import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { LocationsController } from './locations.controller';
import { LocationsService } from './locations.service';
import { Location } from './entities/location.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

const mockLocation: Location = {
  id: 1,
  name: 'Central Library',
  city: { id: 1, name: 'Prague', archived_at: null },
  city_id: 1,
  archived_at: null,
};

const mockService: jest.Mocked<
  Pick<LocationsService, 'create' | 'findAll' | 'findOne' | 'update' | 'remove'>
> = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('LocationsController', (): void => {
  let controller: LocationsController;

  beforeEach(async (): Promise<void> => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocationsController],
      providers: [
        {
          provide: LocationsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<LocationsController>(LocationsController);
    jest.clearAllMocks();
  });

  describe('create', (): void => {
    it('should create and return a location', async (): Promise<void> => {
      const dto: CreateLocationDto = { name: 'Central Library', city_id: 1 };
      mockService.create.mockResolvedValue(mockLocation);

      const result: Location = await controller.create(dto);

      expect(mockService.create).toHaveBeenCalledWith(dto);
      expect(result).toBe(mockLocation);
    });
  });

  describe('findAll', (): void => {
    it('should return all locations', async (): Promise<void> => {
      const locations: Location[] = [mockLocation];
      mockService.findAll.mockResolvedValue(locations);

      const result: Location[] = await controller.findAll();

      expect(mockService.findAll).toHaveBeenCalled();
      expect(result).toBe(locations);
    });
  });

  describe('findOne', (): void => {
    it('should return a location by id', async (): Promise<void> => {
      mockService.findOne.mockResolvedValue(mockLocation);

      const result: Location = await controller.findOne('1');

      expect(mockService.findOne).toHaveBeenCalledWith(1);
      expect(result).toBe(mockLocation);
    });

    it('should propagate NotFoundException when location does not exist', async (): Promise<void> => {
      mockService.findOne.mockRejectedValue(
        new NotFoundException('Location #99 not found')
      );

      await expect(controller.findOne('99')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', (): void => {
    it('should update and return the location', async (): Promise<void> => {
      const dto: UpdateLocationDto = { name: 'Updated' };
      const updated: Location = { ...mockLocation, name: 'Updated' };
      mockService.update.mockResolvedValue(updated);

      const result: Location = await controller.update('1', dto);

      expect(mockService.update).toHaveBeenCalledWith(1, dto);
      expect(result).toBe(updated);
    });

    it('should propagate NotFoundException when location does not exist', async (): Promise<void> => {
      mockService.update.mockRejectedValue(
        new NotFoundException('Location #99 not found')
      );

      await expect(controller.update('99', { name: 'X' })).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('remove', (): void => {
    it('should remove the location', async (): Promise<void> => {
      mockService.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(mockService.remove).toHaveBeenCalledWith(1);
    });

    it('should propagate NotFoundException when location does not exist', async (): Promise<void> => {
      mockService.remove.mockRejectedValue(
        new NotFoundException('Location #99 not found')
      );

      await expect(controller.remove('99')).rejects.toThrow(NotFoundException);
    });
  });
});
