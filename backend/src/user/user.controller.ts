import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Header,
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
import { User } from './user.entity';
import { UserService } from './user.service';
import { CreateUserRequest } from './dto/create_user';
import { UnknownUserException } from '@/lib/errors';

@Controller('users')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class UserController {
  constructor(private userService: UserService) {}

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
      throw new UnknownUserException();
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

  @Delete(':id')
  @ApiOkResponse()
  async deleteUser(@Param('id') id: number) {
    const deleted = await this.userService.deleteUser(id);
    if (!deleted) {
      throw new UnknownUserException();
    }
    return;
  }
}
