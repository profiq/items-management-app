import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { Item } from './entities/item.entity';
import { FindItemsQueryDto } from './dto/find-items-query.dto';
import { PaginatedItemsResponseDto } from './dto/paginated-items-response.dto';

const mockItem: Item = {
  id: 1,
  name: 'Clean Code',
  description: 'A book about clean code',
  image_url: null,
  default_loan_days: 14,
  archived_at: null,
  categories: [],
  tags: [],
};

const mockPaginatedResponse: PaginatedItemsResponseDto = {
  data: [mockItem],
  total: 1,
  page: 1,
  limit: 20,
};

const mockService: jest.Mocked<Pick<ItemsService, 'findAll' | 'findOne'>> = {
  findAll: jest.fn(),
  findOne: jest.fn(),
};

describe('ItemsController', (): void => {
  let controller: ItemsController;

  beforeEach(async (): Promise<void> => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemsController],
      providers: [
        {
          provide: ItemsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ItemsController>(ItemsController);
    jest.clearAllMocks();
  });

  describe('findAll', (): void => {
    it('should pass query to service and return paginated response', async (): Promise<void> => {
      mockService.findAll.mockResolvedValue(mockPaginatedResponse);
      const query: FindItemsQueryDto = { search: 'laptop', page: 1, limit: 20 };

      const result: PaginatedItemsResponseDto = await controller.findAll(query);

      expect(mockService.findAll).toHaveBeenCalledWith(query);
      expect(result).toBe(mockPaginatedResponse);
    });

    it('should return paginated response with empty data when no items match', async (): Promise<void> => {
      const emptyResponse: PaginatedItemsResponseDto = {
        data: [],
        total: 0,
        page: 1,
        limit: 20,
      };
      mockService.findAll.mockResolvedValue(emptyResponse);

      const result = await controller.findAll({} as FindItemsQueryDto);

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('findOne', (): void => {
    it('should return an item by id', async (): Promise<void> => {
      mockService.findOne.mockResolvedValue(mockItem);

      const result: Item = await controller.findOne('1');

      expect(mockService.findOne).toHaveBeenCalledWith(1);
      expect(result).toBe(mockItem);
    });

    it('should propagate NotFoundException when item does not exist', async (): Promise<void> => {
      mockService.findOne.mockRejectedValue(
        new NotFoundException('Item #99 not found')
      );

      await expect(controller.findOne('99')).rejects.toThrow(NotFoundException);
    });
  });
});
