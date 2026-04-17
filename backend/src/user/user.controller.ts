import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@/auth/auth.guard';
import { RolesGuard } from '@/auth/roles.guard';
import { Roles } from '@/auth/roles.decorator';
import { User, UserRole } from './user.entity';
import { UserService } from './user.service';
import { CreateUserRequest } from './dto/create_user';
import { UpdateRoleRequest } from './dto/update_role';
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

  @Patch(':id/role')
  @UseGuards(RolesGuard)
  @Roles(UserRole.Admin)
  @ApiOkResponse({ type: User })
  async updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateRoleRequest
  ): Promise<User> {
    const user = await this.userService.updateUserRole(id, body.role);
    if (!user) {
      throw new UnknownUserException();
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
