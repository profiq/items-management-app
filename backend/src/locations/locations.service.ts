import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './entities/location.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>
  ) {}

  create(createLocationDto: CreateLocationDto): Promise<Location> {
    const location: Location = this.locationRepository.create({
      ...createLocationDto,
      archived_at: null,
    });
    return this.locationRepository.save(location);
  }

  findAll(): Promise<Location[]> {
    return this.locationRepository.find();
  }

  async findOne(id: number): Promise<Location> {
    const location: Location | null = await this.locationRepository.findOneBy({
      id,
    });
    if (!location) {
      throw new NotFoundException(`Location #${id} not found`);
    }
    return location;
  }

  async update(
    id: number,
    updateLocationDto: UpdateLocationDto
  ): Promise<Location> {
    const location: Location = await this.findOne(id);
    Object.assign(location, updateLocationDto);
    return this.locationRepository.save(location);
  }

  async remove(id: number): Promise<void> {
    const location: Location = await this.findOne(id);
    await this.locationRepository.remove(location);
  }
}
