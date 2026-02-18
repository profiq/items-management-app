import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { OfficePet } from '@/office_pet/office_pet.entity';
import { User } from '@/user/user.entity';
import { PetVisit } from '@/pet_visit/pet_visit.entity';

export const dbConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: ':memory:',
  entities: [OfficePet, User, PetVisit],
  synchronize: true,
  dropSchema: true,
};
