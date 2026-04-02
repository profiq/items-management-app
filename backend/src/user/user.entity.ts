import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  Index,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryColumn()
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column()
  @Index()
  @ApiProperty()
  name: string;

  @Column()
  @Index({ unique: true })
  @ApiProperty()
  employee_id: string;
}
