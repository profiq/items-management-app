import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OfficePet } from './office_pet.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddPetRequest } from './dto/add_pet';
import { DataSource } from 'typeorm';
import { UpdatePetRequest } from './dto/update_pet';
import { User } from '@/user/user.entity';
import { UserService } from '@/user/user.service';

@Injectable()
export class OfficePetService {
  constructor(
    @InjectRepository(OfficePet)
    private officePetRepository: Repository<OfficePet>,
    private dataSource: DataSource,
    @Inject(forwardRef(() => UserService))
    private userService: UserService
  ) {}

  async getPets(): Promise<OfficePet[]> {
    return this.officePetRepository.find();
  }

  async getPet(
    id: number,
    include_visits: boolean = false,
    include_owner: boolean = false
  ): Promise<OfficePet | null> {
    return this.officePetRepository.findOne({
      where: { id },
      relations: { visits: include_visits, owner: include_owner },
    });
  }

  async addPet(pet_data: AddPetRequest): Promise<OfficePet | null> {
    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    try {
      const pet = new OfficePet();
      pet.name = pet_data.name;
      pet.race = pet_data.race;
      const owner = await runner.manager.findOneByOrFail(User, {
        employee_id: pet_data.owner_id,
      });
      pet.owner = owner;
      pet.species = pet_data.species;
      await runner.manager.save(pet);
      await runner.commitTransaction();
      return pet;
    } catch {
      await runner.rollbackTransaction();
      return null;
    } finally {
      await runner.release();
    }
  }

  async deletePet(id: number): Promise<number | null | undefined> {
    const result = await this.officePetRepository.delete({ id });
    if (!result) {
      throw new NotFoundException();
    }
    return result.affected;
  }

  async updatePet(
    id: number,
    update_data: UpdatePetRequest
  ): Promise<OfficePet | null> {
    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    try {
      const pet = await runner.manager.findOneOrFail(OfficePet, {
        where: { id },
      });
      pet.name = update_data.name;
      const owner = await runner.manager.findOneOrFail(User, {
        where: { employee_id: update_data.owner_id },
      });
      pet.owner = owner;
      await runner.manager.save(pet);
      runner.commitTransaction();
      return pet;
    } catch {
      runner.rollbackTransaction();
      return null;
    } finally {
      runner.release();
    }
  }

  async getUserPets(id: number): Promise<OfficePet[] | null> {
    const employee = await this.userService.getUserById(id, true);
    if (!employee) {
      return null;
    }
    return employee.pets;
  }
}
