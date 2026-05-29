import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import {
  SlackNotification,
  SlackNotificationType,
} from './entities/slack-notification.entity';
import { SlackService } from '@/slack/slack.service';
import { Loan } from '@/loans/entities/loan.entity';
import { ItemCopy } from '@/item-copies/entities/item-copy.entity';
import { UserService } from '@/user/user.service';
import { EmployeeService } from '@/employee/employee.service';

const UNIQUE_VIOLATION_CODES = new Set([
  'SQLITE_CONSTRAINT',
  'SQLITE_CONSTRAINT_UNIQUE',
  'ER_DUP_ENTRY',
  '23505',
]);

function isUniqueViolation(error: unknown): boolean {
  if (!(error instanceof QueryFailedError)) return false;
  const driver = error.driverError as { code?: string } | undefined;
  return !!driver?.code && UNIQUE_VIOLATION_CODES.has(driver.code);
}

@Injectable()
export class SlackNotificationsService {
  private readonly logger = new Logger(SlackNotificationsService.name);

  constructor(
    @InjectRepository(SlackNotification)
    private readonly slackNotificationRepository: Repository<SlackNotification>,
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
    private readonly slackService: SlackService,
    private readonly userService: UserService,
    private readonly employeeService: EmployeeService
  ) {}

  async notifyLoanStarted(loan: Loan, copy: ItemCopy): Promise<void> {
    try {
      const email = await this.getUserEmail(loan.user_id);
      if (!email) return;

      await this.slackService.sendDm(
        email,
        `Půjčil/a sis ${copy.item.name}. Termín vrácení: ${loan.due_date}.`
      );

      await this.slackNotificationRepository.save(
        this.slackNotificationRepository.create({
          loan_id: loan.id,
          type: SlackNotificationType.LoanStarted,
          sent_at: new Date(),
        })
      );
    } catch (error) {
      this.logger.error(
        `Failed to send loan started notification for loan #${loan.id}`,
        error
      );
    }
  }

  @Cron('0 12 * * *', { timeZone: 'Europe/Prague' })
  async sendDueReminders(): Promise<void> {
    const reminders: Array<{
      days: number;
      type: SlackNotificationType;
    }> = [
      { days: 7, type: SlackNotificationType.Reminder7 },
      { days: 3, type: SlackNotificationType.Reminder3 },
      { days: 1, type: SlackNotificationType.Reminder1 },
    ];

    for (const { days, type } of reminders) {
      const targetDate = this.addDays(this.today(), days);
      const loans = await this.loanRepository
        .createQueryBuilder('loan')
        .leftJoinAndSelect('loan.copy', 'copy')
        .leftJoinAndSelect('copy.item', 'item')
        .where('loan.returned_at IS NULL')
        .andWhere('loan.due_date = :date', { date: targetDate })
        .getMany();

      for (const loan of loans) {
        await this.sendReminder(loan, type, days);
      }
    }
  }

  private async sendReminder(
    loan: Loan,
    type: SlackNotificationType,
    days: number
  ): Promise<void> {
    try {
      await this.slackNotificationRepository.save(
        this.slackNotificationRepository.create({
          loan_id: loan.id,
          type,
          sent_at: new Date(),
        })
      );

      const email = await this.getUserEmail(loan.user_id);
      if (!email) return;

      const itemName = loan.copy.item.name;
      await this.slackService.sendDm(
        email,
        this.buildReminderMessage(itemName, loan.due_date, days)
      );
    } catch (error) {
      if (isUniqueViolation(error)) return;
      this.logger.error(
        `Failed to send ${type} reminder for loan #${loan.id}`,
        error
      );
    }
  }

  private buildReminderMessage(
    itemName: string,
    dueDate: string,
    days: number
  ): string {
    if (days === 1) {
      return `Připomínka: termín vrácení ${itemName} je zítra (${dueDate}).`;
    }
    return `Připomínka: termín vrácení ${itemName} je za ${days} ${days === 7 ? 'dní' : 'dny'} (${dueDate}).`;
  }

  private async getUserEmail(userId: number): Promise<string | null> {
    const user = await this.userService.getUserById(userId);
    if (!user) {
      this.logger.warn(`User #${userId} not found`);
      return null;
    }
    const employee = await this.employeeService.getEmployee(user.employee_id);
    if (!employee) {
      this.logger.warn(
        `Employee not found for user #${userId} (employee_id: ${user.employee_id})`
      );
      return null;
    }
    return employee.email;
  }

  private today(): string {
    return new Date().toISOString().split('T')[0];
  }

  private addDays(dateStr: string, days: number): string {
    const d = new Date(dateStr + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().split('T')[0];
  }
}
