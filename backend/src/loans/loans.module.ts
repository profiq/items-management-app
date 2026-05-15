import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoansService } from './loans.service';
import { LoansController } from './loans.controller';
import { Loan } from './entities/loan.entity';
import { ItemCopy } from '@/item-copies/entities/item-copy.entity';
import { AuthModule } from '@/auth/auth.module';
import { UserModule } from '@/user/user.module';
import { RolesGuard } from '@/auth/roles.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Loan, ItemCopy]), AuthModule, UserModule],
  controllers: [LoansController],
  providers: [LoansService, RolesGuard],
  exports: [LoansService],
})
export class LoansModule {}
