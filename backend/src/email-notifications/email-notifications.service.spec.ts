import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
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

const mockRepository: jest.Mocked<
  Pick<
    Repository<EmailNotification>,
    'create' | 'save' | 'find' | 'findOneBy' | 'remove'
  >
> = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
  remove: jest.fn(),
};

describe('EmailNotificationsService', (): void => {
  let service: EmailNotificationsService;

  beforeEach(async (): Promise<void> => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailNotificationsService,
        {
          provide: getRepositoryToken(EmailNotification),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<EmailNotificationsService>(EmailNotificationsService);
    jest.clearAllMocks();
  });

  describe('create', (): void => {
    it('should create and return a notification with sent_at set to now', async (): Promise<void> => {
      const dto: CreateEmailNotificationDto = { loan_id: 1, type: 'due_soon' };
      mockRepository.create.mockReturnValue(mockNotification);
      mockRepository.save.mockResolvedValue(mockNotification);

      const result: EmailNotification = await service.create(dto);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ loan_id: 1, type: 'due_soon' })
      );
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ sent_at: expect.any(Date) })
      );
      expect(mockRepository.save).toHaveBeenCalledWith(mockNotification);
      expect(result).toEqual(mockNotification);
    });
  });

  describe('findAll', (): void => {
    it('should return all notifications', async (): Promise<void> => {
      const notifications: EmailNotification[] = [mockNotification];
      mockRepository.find.mockResolvedValue(notifications);

      const result: EmailNotification[] = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual(notifications);
    });

    it('should return empty array when no notifications exist', async (): Promise<void> => {
      mockRepository.find.mockResolvedValue([]);

      const result: EmailNotification[] = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', (): void => {
    it('should return a notification by id', async (): Promise<void> => {
      mockRepository.findOneBy.mockResolvedValue(mockNotification);

      const result: EmailNotification = await service.findOne(1);

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(mockNotification);
    });

    it('should throw NotFoundException when notification does not exist', async (): Promise<void> => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(99)).rejects.toThrow(
        'EmailNotification #99 not found'
      );
    });
  });

  describe('remove', (): void => {
    it('should remove the notification', async (): Promise<void> => {
      mockRepository.findOneBy.mockResolvedValue(mockNotification);
      mockRepository.remove.mockResolvedValue(mockNotification);

      await service.remove(1);

      expect(mockRepository.remove).toHaveBeenCalledWith(mockNotification);
    });

    it('should throw NotFoundException when notification does not exist', async (): Promise<void> => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
