import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  forwardRef,
  Get,
  Header,
  Inject,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@/auth/auth.guard';
import { OfficePet } from '@/office_pet/office_pet.entity';
import { User } from './user.entity';
import { UserService } from './user.service';
import { CreateUserRequest } from './dto/create_user';
import { OfficePetService } from '@/office_pet/office_pet.service';

@Controller('users')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class UserController {
  constructor(
    private userService: UserService,
    @Inject(forwardRef(() => OfficePetService))
    private officePetService: OfficePetService
  ) {}

  @Get()
  @Header('Cache-Control', 'max-age=10, private')
  @ApiOkResponse({
    type: [User],
  })
  getUsers(): Promise<User[]> {
    return this.userService.getUsers();
  }

  @Get(':id')
  @Header('Cache-Control', 'max-age=10, private')
  @ApiOkResponse({
    type: User,
  })
  async getUserId(@Param('id', ParseIntPipe) id: number): Promise<User> {
    const user = await this.userService.getUserById(id);
    if (!user) {
      throw new NotFoundException(`Could not find any user with id ${id}`);
    }
    return user;
  }

  @Post()
  @ApiCreatedResponse({
    type: User,
  })
  async createUser(@Body() data: CreateUserRequest): Promise<User> {
    const user = await this.userService.createUser(data);
    if (!user) {
      throw new BadRequestException();
    }
    return user;
  }

  @Get(':id/pets')
  @Header('Cache-Control', 'max-age=10, private')
  @ApiOkResponse({
    type: [OfficePet],
  })
  async getUserPets(@Param('id') id: number): Promise<OfficePet[]> {
    const pets = await this.officePetService.getUserPets(id);
    if (!pets) {
      throw new NotFoundException(`Could not find any user with id ${id}`);
    }
    return pets;
  }

  @Delete(':id')
  @ApiOkResponse()
  async deleteUser(@Param('id') id: number) {
    const deleted = await this.userService.deleteUser(id);
    if (!deleted) {
      throw new NotFoundException(`Could not find any user with id ${id}`);
    }
    return;
  }
}
