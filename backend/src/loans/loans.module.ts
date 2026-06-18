import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoansService } from './loans.service';
import { LoansController } from './loans.controller';
import { Loan } from './entities/loan.entity';
import { ItemCopy } from '@/item-copies/entities/item-copy.entity';
import { AuthModule } from '@/auth/auth.module';
import { UserModule } from '@/user/user.module';
import { SlackNotificationsModule } from '@/slack-notifications/slack-notifications.module';
import { RolesModule } from '@/auth/roles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Loan, ItemCopy]),
    AuthModule,
    RolesModule,
    UserModule,
    SlackNotificationsModule,
  ],
  controllers: [LoansController],
  providers: [LoansService],
  exports: [LoansService],
})
export class LoansModule {}
