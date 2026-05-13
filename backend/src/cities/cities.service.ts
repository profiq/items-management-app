import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { City } from './entities/city.entity';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';

@Injectable()
export class CitiesService {
  constructor(
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>
  ) {}

  create(createCityDto: CreateCityDto): Promise<City> {
    const city: City = this.cityRepository.create({
      ...createCityDto,
      archived_at: null,
    });
    return this.cityRepository.save(city);
  }

  findAll(): Promise<City[]> {
    return this.cityRepository.find({ where: { archived_at: IsNull() } });
  }

  async findOne(id: number): Promise<City> {
    const city: City | null = await this.cityRepository.findOneBy({
      id,
      archived_at: IsNull(),
    });
    if (!city) {
      throw new NotFoundException(`City #${id} not found`);
    }
    return city;
  }

  async update(id: number, updateCityDto: UpdateCityDto): Promise<City> {
    const city: City = await this.findOne(id);
    Object.assign(city, updateCityDto);
    return this.cityRepository.save(city);
  }

  async remove(id: number): Promise<void> {
    const city: City = await this.findOne(id);
    city.archived_at = new Date();
    await this.cityRepository.save(city);
  }
}
