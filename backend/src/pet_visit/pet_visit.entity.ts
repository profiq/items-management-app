import { OfficePet } from '@/office_pet/office_pet.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';

@Entity()
@Index(['date', 'pet'], { unique: true })
export class PetVisit {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column()
  @ApiProperty()
  date: Date;

  @ManyToOne(() => OfficePet, pet => pet.visits, {
    cascade: ['insert', 'update'],
    onDelete: 'CASCADE',
  })
  pet: OfficePet;
}
