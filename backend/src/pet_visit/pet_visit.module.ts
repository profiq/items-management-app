import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PetVisit } from './pet_visit.entity';
import { PetVisitService } from './pet_visit.service';
import { PetVisitController } from './pet_visit.controller';
import { AuthModule } from '@/auth/auth.module';
import { OfficePetModule } from '@/office_pet/office_pet.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([PetVisit]),
    AuthModule,
    forwardRef(() => OfficePetModule),
  ],
  providers: [PetVisitService],
  controllers: [PetVisitController],
  exports: [PetVisitService],
})
export class PetVisitModule {}
