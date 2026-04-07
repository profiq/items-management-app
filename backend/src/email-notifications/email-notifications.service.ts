import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailNotification } from './entities/email-notification.entity';
import { CreateEmailNotificationDto } from './dto/create-email-notification.dto';

@Injectable()
export class EmailNotificationsService {
  constructor(
    @InjectRepository(EmailNotification)
    private readonly emailNotificationRepository: Repository<EmailNotification>
  ) {}

  create(createDto: CreateEmailNotificationDto): Promise<EmailNotification> {
    const notification: EmailNotification =
      this.emailNotificationRepository.create({
        ...createDto,
        sent_at: new Date(),
      });
    return this.emailNotificationRepository.save(notification);
  }

  findAll(): Promise<EmailNotification[]> {
    return this.emailNotificationRepository.find();
  }

  async findOne(id: number): Promise<EmailNotification> {
    const notification: EmailNotification | null =
      await this.emailNotificationRepository.findOneBy({ id });
    if (!notification) {
      throw new NotFoundException(`EmailNotification #${id} not found`);
    }
    return notification;
  }

  async remove(id: number): Promise<void> {
    const notification: EmailNotification = await this.findOne(id);
    await this.emailNotificationRepository.remove(notification);
  }
}
