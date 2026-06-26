import { Module } from '@nestjs/common';
import { AuthModule } from '@/auth/auth.module';
import { RolesModule } from '@/auth/roles.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthController } from '@/auth/auth.controller';
import { User } from './user.entity';
import { EmployeeModule } from '@/employee/employee.module';
import { FirebaseModule } from '@/firebase/firebase.module';

@Module({
  imports: [
    AuthModule,
    RolesModule,
    EmployeeModule,
    TypeOrmModule.forFeature([User]),
    FirebaseModule,
  ],
  providers: [UserService],
  controllers: [UserController, AuthController],
  exports: [UserService],
})
export class UserModule {}
