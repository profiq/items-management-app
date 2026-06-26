import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { AuthModule } from '@/auth/auth.module';
import { RolesModule } from '@/auth/roles.module';
import { ConfigModule } from '@nestjs/config';
import { User } from '@/user/user.entity';

@Module({
  imports: [
    AuthModule,
    RolesModule,
    ConfigModule,
    TypeOrmModule.forFeature([User]),
  ],
  providers: [EmployeeService],
  controllers: [EmployeeController],
  exports: [EmployeeService],
})
export class EmployeeModule {}
