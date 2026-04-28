import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@/auth/auth.module';
import { RolesGuard } from '@/auth/roles.guard';
import { UserModule } from '@/user/user.module';
import { EmailNotificationsService } from './email-notifications.service';
import { EmailNotificationsController } from './email-notifications.controller';
import { EmailNotification } from './entities/email-notification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmailNotification]),
    AuthModule,
    UserModule,
  ],
  controllers: [EmailNotificationsController],
  providers: [EmailNotificationsService, RolesGuard],
  exports: [EmailNotificationsService],
})
export class EmailNotificationsModule {}
