import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Loan } from '@/loans/entities/loan.entity';

export enum SlackNotificationType {
  LoanStarted = 'loan_started',
  Reminder7 = 'reminder_7',
  Reminder3 = 'reminder_3',
  Reminder1 = 'reminder_1',
}

@Entity()
@Unique(['loan_id', 'type'])
export class SlackNotification {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Loan, { nullable: false, eager: false })
  @JoinColumn({ name: 'loan_id' })
  loan: Loan;

  @Column()
  loan_id: number;

  @Column({ type: 'varchar', length: 50 })
  type: SlackNotificationType;

  @Column({ type: 'datetime' })
  sent_at: Date;
}
