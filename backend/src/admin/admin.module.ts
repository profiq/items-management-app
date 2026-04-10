import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AuthModule } from '@/auth/auth.module';
import { UserModule } from '@/user/user.module';
import { RolesGuard } from '@/auth/roles.guard';

@Module({
  imports: [AuthModule, UserModule],
  controllers: [AdminController],
  providers: [AdminService, RolesGuard],
})
export class AdminModule {}
