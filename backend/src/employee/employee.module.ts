import { forwardRef, Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { AuthModule } from '@/auth/auth.module';
import { UserModule } from '@/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { RolesGuard } from '@/auth/roles.guard';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    ConfigModule,
  ],
  providers: [EmployeeService, RolesGuard],
  controllers: [EmployeeController],
  exports: [EmployeeService],
})
export class EmployeeModule {}
