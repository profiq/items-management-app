import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ItemCopy } from '@/item-copies/entities/item-copy.entity';
import { User } from '@/user/user.entity';

@Entity()
@Index('IDX_loan_active_copy_unique', ['copy_id'], {
  unique: true,
  where: '"returned_at" IS NULL',
})
export class Loan {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @ManyToOne(() => ItemCopy, { nullable: false, eager: false })
  @JoinColumn({ name: 'copy_id' })
  copy: ItemCopy;

  @Column()
  @ApiProperty()
  copy_id: number;

  @ManyToOne(() => User, { nullable: false, eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  @ApiProperty()
  user_id: number;

  @Column({ type: 'datetime' })
  @ApiProperty({ type: String, format: 'date-time' })
  borrowed_at: Date;

  @Column({ type: 'date' })
  @ApiProperty({ type: String, format: 'date' })
  due_date: string;

  @Column({ type: 'datetime', nullable: true, default: null })
  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  returned_at: Date | null;

  @ManyToOne(() => User, { nullable: true, eager: false })
  @JoinColumn({ name: 'returned_by_user_id' })
  returned_by_user: User | null;

  @Column({ nullable: true, default: null })
  @ApiPropertyOptional({ nullable: true })
  returned_by_user_id: number | null;
}
