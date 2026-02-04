import { OfficePet } from '@/office_pet/office_pet.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  Index,
  OneToMany,
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

  @OneToMany(() => OfficePet, pet => pet.owner, {
    cascade: ['insert', 'update'],
  })
  pets: OfficePet[];
}
