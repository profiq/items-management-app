import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { LocationsController } from './locations.controller';
import { LocationsService } from './locations.service';
import { Location } from './entities/location.entity';

const mockLocation: Location = {
  id: 1,
  name: 'Central Library',
  city: { id: 1, name: 'Prague', archived_at: null },
  city_id: 1,
  archived_at: null,
};

const mockService: jest.Mocked<Pick<LocationsService, 'findAll' | 'findOne'>> =
  {
    findAll: jest.fn(),
    findOne: jest.fn(),
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
});
