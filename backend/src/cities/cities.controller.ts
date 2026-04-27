import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CitiesService } from './cities.service';
import { City } from './entities/city.entity';

@ApiTags('cities')
@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Get()
  findAll(): Promise<City[]> {
    return this.citiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<City> {
    return this.citiesService.findOne(+id);
  }
}
