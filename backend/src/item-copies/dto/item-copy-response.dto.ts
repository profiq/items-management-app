import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ItemCondition } from '../entities/item-copy.entity';
import { Location } from '@/locations/entities/location.entity';

export class ItemCopyResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  item_id: number;

  @ApiProperty()
  location_id: number;

  @ApiPropertyOptional({ type: () => Location, nullable: true })
  location?: Location;

  @ApiPropertyOptional({ enum: ItemCondition, nullable: true })
  condition: ItemCondition | null;

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  archived_at: Date | null;
}
