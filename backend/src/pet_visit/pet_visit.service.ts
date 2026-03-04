import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataSource } from 'typeorm';
import { PetVisit } from '@/pet_visit/pet_visit.entity';
import { AddVisitRequest } from './dto/add_visit';
import { OfficePet } from '@/office_pet/office_pet.entity';
import { OfficePetService } from '@/office_pet/office_pet.service';
import { RelatedPetException } from '@/lib/errors';

@Injectable()
export class PetVisitService {
  constructor(
    @InjectRepository(PetVisit)
    private petVisitRepository: Repository<PetVisit>,
    private dataSource: DataSource,
    @Inject(forwardRef(() => OfficePetService))
    private officePetService: OfficePetService
  ) {}

  async getPetVisits(): Promise<PetVisit[]> {
    return this.petVisitRepository.find();
  }

  async addPetVisit(visit_data: AddVisitRequest): Promise<PetVisit> {
    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    try {
      const pet = await runner.manager.findOneBy(OfficePet, {
        id: visit_data.pet_id,
      });

      if (!pet) {
        throw new RelatedPetException();
      }

      const visit = new PetVisit();
      visit.pet = pet;
      visit.date = visit_data.date || new Date();
      await runner.manager.save(visit);
      return visit;
    } catch (e) {
      await runner.rollbackTransaction();
      throw e;
    } finally {
      await runner.release();
    }
  }

  async getPetVisitsForPet(id: number): Promise<PetVisit[]> {
    const pet = await this.officePetService.getPet(id, true);
    return pet.visits;
  }
}
