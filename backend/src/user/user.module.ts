import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from '@/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { EmployeeModule } from '@/employee/employee.module';
import { RolesGuard } from '@/auth/roles.guard';
import { FirebaseModule } from '@/firebase/firebase.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => EmployeeModule),
    TypeOrmModule.forFeature([User]),
    FirebaseModule,
  ],
  providers: [UserService, RolesGuard],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
