import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum UserRole {
  Admin = 'admin',
  User = 'user',
}

@Entity()
export class User {
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

  @Column({ type: 'varchar', default: UserRole.User })
  @ApiProperty({ enum: UserRole, default: UserRole.User })
  role: UserRole;
}
