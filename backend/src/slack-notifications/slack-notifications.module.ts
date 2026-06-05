import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SlackNotificationsService } from './slack-notifications.service';
import { SlackNotification } from './entities/slack-notification.entity';
import { SlackModule } from '@/slack/slack.module';
import { UserModule } from '@/user/user.module';
import { EmployeeModule } from '@/employee/employee.module';
import { Loan } from '@/loans/entities/loan.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SlackNotification, Loan]),
    SlackModule,
    UserModule,
    EmployeeModule,
  ],
  providers: [SlackNotificationsService],
  exports: [SlackNotificationsService],
})
export class SlackNotificationsModule {}
