import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { ItemCondition } from '../entities/item-copy.entity';

export class CreateItemCopyDto {
  @ApiProperty()
  @IsInt()
  item_id: number;

  @ApiProperty()
  @IsInt()
  location_id: number;

  @ApiPropertyOptional({ enum: ItemCondition, nullable: true })
  @IsOptional()
  @IsEnum(ItemCondition)
  condition?: ItemCondition | null;
}
