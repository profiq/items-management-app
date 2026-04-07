import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateItemCopyDto {
  @ApiProperty()
  item_id: number;

  @ApiProperty()
  location_id: number;

  @ApiPropertyOptional({ nullable: true })
  condition?: string | null;
}
