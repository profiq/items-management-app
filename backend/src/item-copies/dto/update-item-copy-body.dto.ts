import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { ItemCondition } from '../entities/item-copy.entity';

export class UpdateItemCopyBodyDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  location_id?: number;

  @ApiPropertyOptional({ enum: ItemCondition, nullable: true })
  @IsOptional()
  @IsEnum(ItemCondition)
  condition?: ItemCondition | null;
}
