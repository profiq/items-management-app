import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CitiesController } from './cities.controller';
import { CitiesService } from './cities.service';
import { City } from './entities/city.entity';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';

const mockCity: City = {
  id: 1,
  name: 'Prague',
  archived_at: null,
};

const mockService: jest.Mocked<
  Pick<CitiesService, 'create' | 'findAll' | 'findOne' | 'update' | 'remove'>
> = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
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

  describe('create', (): void => {
    it('should create and return a city', async (): Promise<void> => {
      const dto: CreateCityDto = { name: 'Prague' };
      mockService.create.mockResolvedValue(mockCity);

      const result: City = await controller.create(dto);

      expect(mockService.create).toHaveBeenCalledWith(dto);
      expect(result).toBe(mockCity);
    });
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

  describe('update', (): void => {
    it('should update and return the city', async (): Promise<void> => {
      const dto: UpdateCityDto = { name: 'Updated' };
      const updated: City = { ...mockCity, name: 'Updated' };
      mockService.update.mockResolvedValue(updated);

      const result: City = await controller.update('1', dto);

      expect(mockService.update).toHaveBeenCalledWith(1, dto);
      expect(result).toBe(updated);
    });

    it('should propagate NotFoundException when city does not exist', async (): Promise<void> => {
      mockService.update.mockRejectedValue(
        new NotFoundException('City #99 not found')
      );

      await expect(controller.update('99', { name: 'X' })).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('remove', (): void => {
    it('should remove the city', async (): Promise<void> => {
      mockService.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(mockService.remove).toHaveBeenCalledWith(1);
    });

    it('should propagate NotFoundException when city does not exist', async (): Promise<void> => {
      mockService.remove.mockRejectedValue(
        new NotFoundException('City #99 not found')
      );

      await expect(controller.remove('99')).rejects.toThrow(NotFoundException);
    });
  });
});
