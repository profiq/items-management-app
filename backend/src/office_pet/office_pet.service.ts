import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { OfficePet } from './office_pet.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddPetRequest } from './dto/add_pet';
import { DataSource } from 'typeorm';
import { UpdatePetRequest } from './dto/update_pet';
import { User } from '@/user/user.entity';
import { UserService } from '@/user/user.service';
import { FirebaseService } from '@/firebase/firebase.service';
import {
  RelatedOwnerException,
  UnknownPetException,
  UnknownUserException,
} from '@/lib/errors';

@Injectable()
export class OfficePetService {
  constructor(
    @InjectRepository(OfficePet)
    private officePetRepository: Repository<OfficePet>,
    private dataSource: DataSource,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    private firebaseService: FirebaseService
  ) {}

  async getPets(): Promise<OfficePet[]> {
    return this.officePetRepository.find();
  }

  async getPet(
    id: number,
    include_visits: boolean = false,
    include_owner: boolean = false
  ): Promise<OfficePet> {
    const pet = await this.officePetRepository.findOne({
      where: { id },
      relations: { visits: include_visits, owner: include_owner },
    });
    if (!pet) {
      throw new UnknownPetException();
    }
    return pet;
  }

  async addPet(
    pet_data: AddPetRequest,
    image_file?: Express.Multer.File
  ): Promise<OfficePet> {
    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    try {
      const pet = new OfficePet();
      pet.name = pet_data.name;
      pet.race = pet_data.race;
      const owner = await runner.manager.findOneBy(User, {
        employee_id: pet_data.owner_id,
      });

      if (!owner) {
        throw new RelatedOwnerException();
      }

      pet.owner = owner;
      pet.species = pet_data.species;
      const new_pet = await runner.manager.save(pet);

      if (image_file) {
        new_pet.image_url = await this.firebaseService.upload(
          `pet-img-${pet.id}`,
          image_file.buffer
        );

        await runner.manager.save(new_pet);
      }

      await runner.commitTransaction();
      return pet;
    } catch (e) {
      await runner.rollbackTransaction();
      throw e;
    } finally {
      await runner.release();
    }
  }

  async deletePet(id: number): Promise<number | null | undefined> {
    const pet = await this.getPet(id);
    if (pet?.image_url) {
      await this.firebaseService.delete(`pet-img-${id}`);
    }
    const result = await this.officePetRepository.delete({ id });

    return result.affected;
  }

  async updatePet(
    id: number,
    update_data: UpdatePetRequest,
    image_file?: Express.Multer.File
  ): Promise<OfficePet> {
    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    try {
      const pet = await runner.manager.findOne(OfficePet, {
        where: { id },
      });
      if (!pet) {
        throw new UnknownPetException();
      }
      pet.name = update_data.name;
      const owner = await runner.manager.findOne(User, {
        where: { employee_id: update_data.owner_id },
      });
      if (!owner) {
        throw new RelatedOwnerException();
      }

      if (image_file) {
        pet.image_url = await this.firebaseService.upload(
          `pet-img-${id}`,
          image_file.buffer
        );
      }

      pet.owner = owner;
      pet.species = update_data.species;
      pet.race = update_data.race;
      await runner.manager.save(pet);
      await runner.commitTransaction();
      return pet;
    } catch (e) {
      await runner.rollbackTransaction();
      throw e;
    } finally {
      await runner.release();
    }
  }

  async getUserPets(id: number): Promise<OfficePet[]> {
    const employee = await this.userService.getUserById(id, true);
    if (!employee) {
      throw new UnknownUserException();
    }
    return employee.pets;
  }
}
