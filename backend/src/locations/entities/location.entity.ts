import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { City } from '../../cities/entities/city.entity';

@Entity()
export class Location {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column()
  @ApiProperty()
  name: string;

  @ManyToOne(() => City, { nullable: false, eager: false })
  @JoinColumn({ name: 'city_id' })
  city: City;

  @Column()
  @ApiProperty()
  city_id: number;

  @Column({ type: 'datetime', nullable: true, default: null })
  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  archived_at: Date | null;
}
