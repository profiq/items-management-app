import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OfficePet } from './office_pet.entity';
import { PetVisit } from '@/pet_visit/pet_visit.entity';
import { OfficePetService } from './office_pet.service';
import { OfficePetController } from './office_pet.controller';
import { AuthModule } from '@/auth/auth.module';
import { UserModule } from '@/user/user.module';
import { PetVisitModule } from '@/pet_visit/pet_visit.module';
import { EmployeeHydrationModule } from '@/employee_hydration/employee_hydration.module';
import { FirebaseModule } from '@/firebase/firebase.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OfficePet, PetVisit]),
    AuthModule,
    forwardRef(() => UserModule),
    forwardRef(() => PetVisitModule),
    EmployeeHydrationModule,
    FirebaseModule,
  ],
  providers: [OfficePetService],
  controllers: [OfficePetController],
  exports: [OfficePetService],
})
export class OfficePetModule {}
