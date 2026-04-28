import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@/auth/auth.guard';
import { RolesGuard } from '@/auth/roles.guard';
import { Roles } from '@/auth/roles.decorator';
import { UnknownUserException } from '@/lib/errors';
import { User, UserRole } from '@/user/user.entity';
import { UserService } from '@/user/user.service';
import { EmailNotificationsService } from './email-notifications.service';
import { CreateEmailNotificationDto } from './dto/create-email-notification.dto';
import { EmailNotification } from './entities/email-notification.entity';

type FirebaseRequest = {
  firebaseUser: DecodedIdToken;
};

@ApiTags('email-notifications')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('email-notifications')
export class EmailNotificationsController {
  constructor(
    private readonly emailNotificationsService: EmailNotificationsService,
    private readonly userService: UserService
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.Admin)
  create(
    @Body() createDto: CreateEmailNotificationDto
  ): Promise<EmailNotification> {
    return this.emailNotificationsService.create(createDto);
  }

  @Get()
  async findAll(@Req() req: FirebaseRequest): Promise<EmailNotification[]> {
    const currentUser = await this.getCurrentUserOrThrow(req);
    if (currentUser.role === UserRole.Admin) {
      return this.emailNotificationsService.findAll();
    }
    return this.emailNotificationsService.findAllForUser(currentUser.id);
  }

  @Get(':id')
  async findOne(
    @Req() req: FirebaseRequest,
    @Param('id', ParseIntPipe) id: number
  ): Promise<EmailNotification> {
    const currentUser = await this.getCurrentUserOrThrow(req);
    if (currentUser.role === UserRole.Admin) {
      return this.emailNotificationsService.findOne(id);
    }
    return this.emailNotificationsService.findOneForUser(id, currentUser.id);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.Admin)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.emailNotificationsService.remove(id);
  }

  private async getCurrentUserOrThrow(req: FirebaseRequest): Promise<User> {
    const currentUser = await this.userService.getUserByGoogleWorkspaceUid(
      req.firebaseUser
    );
    if (!currentUser) {
      throw new UnknownUserException();
    }
    return currentUser;
  }
}
