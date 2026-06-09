import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@/auth/auth.module';
import { RolesModule } from '@/auth/roles.module';
import { UserModule } from '@/user/user.module';
import { EmailNotificationsService } from './email-notifications.service';
import { EmailNotificationsController } from './email-notifications.controller';
import { EmailNotification } from './entities/email-notification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmailNotification]),
    AuthModule,
    RolesModule,
    UserModule,
  ],
  controllers: [EmailNotificationsController],
  providers: [EmailNotificationsService],
  exports: [EmailNotificationsService],
})
export class EmailNotificationsModule {}
