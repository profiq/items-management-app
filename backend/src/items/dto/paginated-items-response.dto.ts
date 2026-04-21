import { ApiProperty } from '@nestjs/swagger';
import { Item } from '../entities/item.entity';

export class PaginatedItemsResponseDto {
  @ApiProperty({ type: () => Item, isArray: true })
  data: Item[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}
