import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from '@/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OfficePet } from '@/office_pet/office_pet.entity';
import { PetVisit } from '@/pet_visit/pet_visit.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { EmployeeModule } from '@/employee/employee.module';
import { OfficePetModule } from '@/office_pet/office_pet.module';

@Module({
  imports: [
    AuthModule,
    forwardRef(() => EmployeeModule),
    TypeOrmModule.forFeature([User, OfficePet, PetVisit]),
    forwardRef(() => OfficePetModule),
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
