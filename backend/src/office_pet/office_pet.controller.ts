import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  forwardRef,
  Get,
  Inject,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@/auth/auth.guard';
import { OfficePetService } from './office_pet.service';
import { AddPetRequest } from './dto/add_pet';
import { UpdatePetRequest } from './dto/update_pet';
import { OfficePet } from './office_pet.entity';
import { PetVisit } from '@/pet_visit/pet_visit.entity';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { PetVisitService } from '@/pet_visit/pet_visit.service';
import { EmployeeHydrationInterceptor } from '@/employee_hydration/employee_hydration.interceptor';

@ApiBearerAuth()
@Controller('pets')
@UseGuards(AuthGuard)
export class OfficePetController {
  constructor(
    private officePetService: OfficePetService,
    @Inject(forwardRef(() => PetVisitService))
    private petVisitService: PetVisitService
  ) {}

  @Post()
  @UseInterceptors(EmployeeHydrationInterceptor)
  @ApiCreatedResponse({
    type: OfficePet,
  })
  async addPet(@Body() data: AddPetRequest): Promise<OfficePet> {
    const pet = await this.officePetService.addPet(data);
    if (!pet) {
      throw new NotFoundException();
    }
    return pet;
  }

  @Get()
  @ApiOkResponse({
    type: [OfficePet],
  })
  async getPets(): Promise<OfficePet[]> {
    return this.officePetService.getPets();
  }

  @Get(':id')
  @ApiOkResponse({
    type: OfficePet,
  })
  @ApiNotFoundResponse()
  async getPetId(@Param('id', ParseIntPipe) id: number): Promise<OfficePet> {
    const pet = await this.officePetService.getPet(id);
    if (!pet) {
      throw new NotFoundException();
    }
    return pet;
  }

  @Put(':id')
  @UseInterceptors(EmployeeHydrationInterceptor)
  @ApiOkResponse({
    type: OfficePet,
  })
  async updatePet(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdatePetRequest
  ): Promise<OfficePet> {
    const pet = await this.officePetService.updatePet(id, data);
    if (pet === null) {
      throw new NotFoundException();
    }
    if (pet === undefined) {
      throw new BadRequestException();
    }
    return pet;
  }

  @Delete(':id')
  @ApiOkResponse({
    type: OfficePet,
  })
  async deletePet(@Param('id', ParseIntPipe) id: number): Promise<number> {
    const affected = await this.officePetService.deletePet(id);
    if (!affected) {
      throw new NotFoundException();
    }
    return affected;
  }

  @Get(':id/visits')
  @ApiOkResponse({
    type: [PetVisit],
  })
  async getVisits(@Param('id', ParseIntPipe) id: number): Promise<PetVisit[]> {
    const visits = await this.petVisitService.getPetVisitsForPet(id);
    if (!visits) {
      throw new NotFoundException();
    }
    return visits;
  }
}
