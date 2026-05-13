import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Location } from './entities/location.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { City } from '@/cities/entities/city.entity';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>
  ) {}

  private async findActiveCityOrThrow(id: number): Promise<City> {
    const city: City | null = await this.cityRepository.findOneBy({
      id,
      archived_at: IsNull(),
    });
    if (!city) {
      throw new NotFoundException(`City #${id} not found`);
    }
    return city;
  }

  async create(createLocationDto: CreateLocationDto): Promise<Location> {
    await this.findActiveCityOrThrow(createLocationDto.city_id);
    const location: Location = this.locationRepository.create({
      ...createLocationDto,
      archived_at: null,
    });
    return this.locationRepository.save(location);
  }

  findAll(): Promise<Location[]> {
    return this.locationRepository.find({ where: { archived_at: IsNull() } });
  }

  async findOne(id: number): Promise<Location> {
    const location: Location | null = await this.locationRepository.findOneBy({
      id,
      archived_at: IsNull(),
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
    if (updateLocationDto.city_id !== undefined) {
      await this.findActiveCityOrThrow(updateLocationDto.city_id);
    }
    Object.assign(location, updateLocationDto);
    return this.locationRepository.save(location);
  }

  async remove(id: number): Promise<void> {
    const location: Location = await this.findOne(id);
    location.archived_at = new Date();
    await this.locationRepository.save(location);
  }
}
