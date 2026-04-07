import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Location } from './entities/location.entity';

@ApiTags('locations')
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  create(@Body() createLocationDto: CreateLocationDto): Promise<Location> {
    return this.locationsService.create(createLocationDto);
  }

  @Get()
  findAll(): Promise<Location[]> {
    return this.locationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Location> {
    return this.locationsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLocationDto: UpdateLocationDto
  ): Promise<Location> {
    return this.locationsService.update(+id, updateLocationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.locationsService.remove(+id);
  }
}
