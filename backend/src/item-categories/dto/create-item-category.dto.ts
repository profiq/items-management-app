import { ApiProperty } from '@nestjs/swagger';

export class CreateItemCategoryDto {
  @ApiProperty()
  item_id: number;

  @ApiProperty()
  category_id: number;
}
