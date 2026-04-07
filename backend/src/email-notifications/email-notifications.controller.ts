import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EmailNotificationsService } from './email-notifications.service';
import { CreateEmailNotificationDto } from './dto/create-email-notification.dto';
import { EmailNotification } from './entities/email-notification.entity';

@ApiTags('email-notifications')
@Controller('email-notifications')
export class EmailNotificationsController {
  constructor(
    private readonly emailNotificationsService: EmailNotificationsService
  ) {}

  @Post()
  create(
    @Body() createDto: CreateEmailNotificationDto
  ): Promise<EmailNotification> {
    return this.emailNotificationsService.create(createDto);
  }

  @Get()
  findAll(): Promise<EmailNotification[]> {
    return this.emailNotificationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<EmailNotification> {
    return this.emailNotificationsService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.emailNotificationsService.remove(+id);
  }
}
