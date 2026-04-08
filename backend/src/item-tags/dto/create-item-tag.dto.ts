import { ApiProperty } from '@nestjs/swagger';

export class CreateItemTagDto {
  @ApiProperty()
  item_id: number;

  @ApiProperty()
  tag_id: number;
}
