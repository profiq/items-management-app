import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from '@/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { EmployeeModule } from '@/employee/employee.module';

@Module({
  imports: [
    AuthModule,
    forwardRef(() => EmployeeModule),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
