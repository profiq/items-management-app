import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Loan } from '../../loans/entities/loan.entity';

@Entity()
export class EmailNotification {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @ManyToOne(() => Loan, { nullable: false, eager: false })
  @JoinColumn({ name: 'loan_id' })
  loan: Loan;

  @Column()
  @ApiProperty()
  loan_id: number;

  @Column()
  @ApiProperty()
  type: string;

  @Column({ type: 'datetime' })
  @ApiProperty({ type: String, format: 'date-time' })
  sent_at: Date;
}
