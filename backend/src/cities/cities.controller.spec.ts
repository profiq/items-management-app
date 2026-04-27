import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CitiesController } from './cities.controller';
import { CitiesService } from './cities.service';
import { City } from './entities/city.entity';

const mockCity: City = {
  id: 1,
  name: 'Prague',
  archived_at: null,
};

const mockService: jest.Mocked<Pick<CitiesService, 'findAll' | 'findOne'>> = {
  findAll: jest.fn(),
  findOne: jest.fn(),
};

describe('CitiesController', (): void => {
  let controller: CitiesController;

  beforeEach(async (): Promise<void> => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CitiesController],
      providers: [
        {
          provide: CitiesService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<CitiesController>(CitiesController);
    jest.clearAllMocks();
  });

  describe('findAll', (): void => {
    it('should return all cities', async (): Promise<void> => {
      const cities: City[] = [mockCity];
      mockService.findAll.mockResolvedValue(cities);

      const result: City[] = await controller.findAll();

      expect(mockService.findAll).toHaveBeenCalled();
      expect(result).toBe(cities);
    });
  });

  describe('findOne', (): void => {
    it('should return a city by id', async (): Promise<void> => {
      mockService.findOne.mockResolvedValue(mockCity);

      const result: City = await controller.findOne('1');

      expect(mockService.findOne).toHaveBeenCalledWith(1);
      expect(result).toBe(mockCity);
    });

    it('should propagate NotFoundException when city does not exist', async (): Promise<void> => {
      mockService.findOne.mockRejectedValue(
        new NotFoundException('City #99 not found')
      );

      await expect(controller.findOne('99')).rejects.toThrow(NotFoundException);
    });
  });
});
