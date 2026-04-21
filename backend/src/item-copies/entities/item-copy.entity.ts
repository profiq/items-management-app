import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Item } from '@/items/entities/item.entity';
import { Location } from '@/locations/entities/location.entity';

export enum ItemCondition {
  Good = 'good',
  Damaged = 'damaged',
  Lost = 'lost',
}

@Entity()
export class ItemCopy {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @ManyToOne(() => Item, item => item.copies, { nullable: false, eager: false })
  @JoinColumn({ name: 'item_id' })
  item: Item;

  @Column()
  @ApiProperty()
  item_id: number;

  @ManyToOne(() => Location, { nullable: false, eager: false })
  @JoinColumn({ name: 'location_id' })
  location: Location;

  @Column()
  @ApiProperty()
  location_id: number;

  @Column({ type: 'varchar', nullable: true, default: null })
  @ApiPropertyOptional({ enum: ItemCondition, nullable: true })
  condition: ItemCondition | null;

  @Column({ type: 'datetime', nullable: true, default: null })
  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  archived_at: Date | null;
}
