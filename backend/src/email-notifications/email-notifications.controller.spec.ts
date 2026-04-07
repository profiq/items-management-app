import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EmailNotificationsController } from './email-notifications.controller';
import { EmailNotificationsService } from './email-notifications.service';
import { EmailNotification } from './entities/email-notification.entity';
import { CreateEmailNotificationDto } from './dto/create-email-notification.dto';

const mockNotification: EmailNotification = {
  id: 1,
  loan: { id: 1 } as EmailNotification['loan'],
  loan_id: 1,
  type: 'due_soon',
  sent_at: new Date('2026-04-01T10:00:00Z'),
};

const mockService: jest.Mocked<
  Pick<EmailNotificationsService, 'create' | 'findAll' | 'findOne' | 'remove'>
> = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
};

describe('EmailNotificationsController', (): void => {
  let controller: EmailNotificationsController;

  beforeEach(async (): Promise<void> => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmailNotificationsController],
      providers: [
        {
          provide: EmailNotificationsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<EmailNotificationsController>(
      EmailNotificationsController
    );
    jest.clearAllMocks();
  });

  describe('create', (): void => {
    it('should create and return a notification', async (): Promise<void> => {
      const dto: CreateEmailNotificationDto = { loan_id: 1, type: 'due_soon' };
      mockService.create.mockResolvedValue(mockNotification);

      const result: EmailNotification = await controller.create(dto);

      expect(mockService.create).toHaveBeenCalledWith(dto);
      expect(result).toBe(mockNotification);
    });
  });

  describe('findAll', (): void => {
    it('should return all notifications', async (): Promise<void> => {
      const notifications: EmailNotification[] = [mockNotification];
      mockService.findAll.mockResolvedValue(notifications);

      const result: EmailNotification[] = await controller.findAll();

      expect(mockService.findAll).toHaveBeenCalled();
      expect(result).toBe(notifications);
    });
  });

  describe('findOne', (): void => {
    it('should return a notification by id', async (): Promise<void> => {
      mockService.findOne.mockResolvedValue(mockNotification);

      const result: EmailNotification = await controller.findOne('1');

      expect(mockService.findOne).toHaveBeenCalledWith(1);
      expect(result).toBe(mockNotification);
    });

    it('should propagate NotFoundException when notification does not exist', async (): Promise<void> => {
      mockService.findOne.mockRejectedValue(
        new NotFoundException('EmailNotification #99 not found')
      );

      await expect(controller.findOne('99')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', (): void => {
    it('should remove the notification', async (): Promise<void> => {
      mockService.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(mockService.remove).toHaveBeenCalledWith(1);
    });

    it('should propagate NotFoundException when notification does not exist', async (): Promise<void> => {
      mockService.remove.mockRejectedValue(
        new NotFoundException('EmailNotification #99 not found')
      );

      await expect(controller.remove('99')).rejects.toThrow(NotFoundException);
    });
  });
});
