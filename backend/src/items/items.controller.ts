import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ItemsService } from './items.service';
import { Item } from './entities/item.entity';
import { FindItemsQueryDto } from './dto/find-items-query.dto';
import { PaginatedItemsResponseDto } from './dto/paginated-items-response.dto';

@ApiTags('items')
@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  @ApiOkResponse({ type: PaginatedItemsResponseDto })
  findAll(
    @Query() query: FindItemsQueryDto
  ): Promise<PaginatedItemsResponseDto> {
    return this.itemsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Item> {
    return this.itemsService.findOne(+id);
  }
}
