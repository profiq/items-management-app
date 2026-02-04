import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@/auth/auth.guard';
import { PetVisitService } from './pet_visit.service';
import { AddVisitRequest } from './dto/add_visit';
import { PetVisit } from './pet_visit.entity';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';

@Controller('visits')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class PetVisitController {
  constructor(private petVisitService: PetVisitService) {}

  @Get()
  @ApiOkResponse({
    type: [PetVisit],
  })
  async getVisits(): Promise<PetVisit[]> {
    return this.petVisitService.getPetVisits();
  }

  @Post()
  @ApiCreatedResponse({
    type: PetVisit,
  })
  async addVisit(@Body() data: AddVisitRequest): Promise<PetVisit> {
    const visit = await this.petVisitService.addPetVisit(data);
    if (!visit) {
      throw new NotFoundException();
    }
    return visit;
  }
}
