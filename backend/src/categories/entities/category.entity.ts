import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column()
  @ApiProperty()
  name: string;

  @Column({ type: 'datetime', nullable: true, default: null })
  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  archived_at: Date | null;
}
