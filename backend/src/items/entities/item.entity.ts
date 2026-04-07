import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Item {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column()
  @ApiProperty()
  name: string;

  @Column({ type: 'text', nullable: true, default: null })
  @ApiPropertyOptional({ nullable: true })
  description: string | null;

  @Column({ type: 'varchar', nullable: true, default: null })
  @ApiPropertyOptional({ nullable: true })
  image_url: string | null;

  @Column()
  @ApiProperty()
  default_loan_days: number;

  @Column({ type: 'datetime', nullable: true, default: null })
  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  archived_at: Date | null;
}
