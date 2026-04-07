import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailNotificationsService } from './email-notifications.service';
import { EmailNotificationsController } from './email-notifications.controller';
import { EmailNotification } from './entities/email-notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EmailNotification])],
  controllers: [EmailNotificationsController],
  providers: [EmailNotificationsService],
  exports: [EmailNotificationsService],
})
export class EmailNotificationsModule {}
