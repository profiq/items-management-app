import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  forwardRef,
  Get,
  Inject,
  InternalServerErrorException,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Post,
  Put,
  UploadedFile,
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
import { User } from '@/user/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { ByteSize } from '@/lib/size';

const MAX_UPLOAD_SIZE = 1 * ByteSize.MB;

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
  @UseInterceptors(FileInterceptor('image_file'), EmployeeHydrationInterceptor)
  @ApiCreatedResponse({
    type: OfficePet,
  })
  async addPet(
    @Body() data: AddPetRequest,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_UPLOAD_SIZE }),
          new FileTypeValidator({ fileType: /^image\/(png|jpeg)/ }),
        ],
        fileIsRequired: false,
      })
    )
    image_file?: Express.Multer.File
  ): Promise<OfficePet> {
    return await this.officePetService.addPet(data, image_file);
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
    return await this.officePetService.getPet(id);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image_file'), EmployeeHydrationInterceptor)
  @ApiOkResponse({
    type: OfficePet,
  })
  async updatePet(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdatePetRequest,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_UPLOAD_SIZE }),
          new FileTypeValidator({ fileType: /^image\/(png|jpeg)/ }),
        ],
        fileIsRequired: false,
      })
    )
    image_file?: Express.Multer.File
  ): Promise<OfficePet> {
    return await this.officePetService.updatePet(id, data, image_file);
  }

  @Delete(':id')
  @ApiOkResponse({
    type: OfficePet,
  })
  async deletePet(@Param('id', ParseIntPipe) id: number): Promise<number> {
    const affected = await this.officePetService.deletePet(id);
    if (!affected) {
      throw new InternalServerErrorException();
    }
    return affected;
  }

  @Get(':id/visits')
  @ApiOkResponse({
    type: [PetVisit],
  })
  async getVisits(@Param('id', ParseIntPipe) id: number): Promise<PetVisit[]> {
    return await this.petVisitService.getPetVisitsForPet(id);
  }

  @Get(':id/owner')
  @ApiOkResponse({
    type: User,
  })
  async getOwner(@Param('id', ParseIntPipe) id: number): Promise<User> {
    const pet = await this.officePetService.getPet(id, false, true);
    return pet.owner;
  }
}
