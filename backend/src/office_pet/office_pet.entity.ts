import { PetVisit } from '@/pet_visit/pet_visit.entity';
import { User } from '@/user/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class OfficePet {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column()
  @ApiProperty()
  name: string;

  @Column()
  @ApiProperty()
  species: string;

  @Column()
  @ApiProperty()
  race: string;

  @Column({ nullable: true })
  @ApiProperty({ nullable: true })
  image_url?: string;

  @ManyToOne(() => User, user => user.pets, {
    cascade: ['insert', 'update'],
    onDelete: 'CASCADE',
  })
  owner: User;

  @OneToMany(() => PetVisit, visit => visit.pet, {
    cascade: ['insert', 'update'],
  })
  visits: PetVisit[];
}
