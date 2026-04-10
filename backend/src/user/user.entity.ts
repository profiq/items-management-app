import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  Index,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum UserRole {
  Admin = 'admin',
  User = 'user',
}

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

  @Column({ type: 'varchar', nullable: true })
  @Index({ unique: true })
  @ApiProperty({ required: false })
  firebase_uid: string | null;

  @Column({ type: 'varchar', nullable: true })
  @ApiProperty({ required: false })
  email: string | null;

  @Column({ type: 'varchar', default: UserRole.User })
  @ApiProperty({ enum: UserRole, default: UserRole.User })
  role: UserRole;
}
