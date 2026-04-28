import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@/auth/auth.guard';
import { RolesGuard } from '@/auth/roles.guard';
import { EmailNotificationsController } from './email-notifications.controller';
import { EmailNotificationsService } from './email-notifications.service';
import { EmailNotification } from './entities/email-notification.entity';
import { CreateEmailNotificationDto } from './dto/create-email-notification.dto';
import { User, UserRole } from '@/user/user.entity';
import { UserService } from '@/user/user.service';
import { buildDecodedToken } from '../../test/auth';

const mockNotification: EmailNotification = {
  id: 1,
  loan: { id: 1 } as EmailNotification['loan'],
  loan_id: 1,
  type: 'due_soon',
  sent_at: new Date('2026-04-01T10:00:00Z'),
};

const mockService: jest.Mocked<
  Pick<
    EmailNotificationsService,
    | 'create'
    | 'findAll'
    | 'findAllForUser'
    | 'findOne'
    | 'findOneForUser'
    | 'remove'
  >
> = {
  create: jest.fn(),
  findAll: jest.fn(),
  findAllForUser: jest.fn(),
  findOne: jest.fn(),
  findOneForUser: jest.fn(),
  remove: jest.fn(),
};

const mockUserService: jest.Mocked<
  Pick<UserService, 'getUserByGoogleWorkspaceUid'>
> = {
  getUserByGoogleWorkspaceUid: jest.fn(),
};

const mockAdminUser: User = {
  id: 10,
  name: 'Admin User',
  employee_id: 'admin-employee',
  role: UserRole.Admin,
};

const mockReaderUser: User = {
  id: 11,
  name: 'Reader User',
  employee_id: 'reader-employee',
  role: UserRole.User,
};

const mockRequest = {
  firebaseUser: buildDecodedToken(
    'reader-employee',
    'reader@profiq.com',
    'firebase-user'
  ),
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
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

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
    it('should return all notifications for admin', async (): Promise<void> => {
      const notifications: EmailNotification[] = [mockNotification];
      mockUserService.getUserByGoogleWorkspaceUid.mockResolvedValue(
        mockAdminUser
      );
      mockService.findAll.mockResolvedValue(notifications);

      const result: EmailNotification[] = await controller.findAll(mockRequest);

      expect(mockService.findAll).toHaveBeenCalled();
      expect(result).toBe(notifications);
    });

    it('should return only the current user notifications for readers', async (): Promise<void> => {
      const notifications: EmailNotification[] = [mockNotification];
      mockUserService.getUserByGoogleWorkspaceUid.mockResolvedValue(
        mockReaderUser
      );
      mockService.findAllForUser.mockResolvedValue(notifications);

      const result: EmailNotification[] = await controller.findAll(mockRequest);

      expect(mockService.findAllForUser).toHaveBeenCalledWith(
        mockReaderUser.id
      );
      expect(result).toBe(notifications);
    });
  });

  describe('findOne', (): void => {
    it('should return a notification by id for admin', async (): Promise<void> => {
      mockUserService.getUserByGoogleWorkspaceUid.mockResolvedValue(
        mockAdminUser
      );
      mockService.findOne.mockResolvedValue(mockNotification);

      const result: EmailNotification = await controller.findOne(
        mockRequest,
        1
      );

      expect(mockService.findOne).toHaveBeenCalledWith(1);
      expect(result).toBe(mockNotification);
    });

    it('should return a notification by id for the owner', async (): Promise<void> => {
      mockUserService.getUserByGoogleWorkspaceUid.mockResolvedValue(
        mockReaderUser
      );
      mockService.findOneForUser.mockResolvedValue(mockNotification);

      const result: EmailNotification = await controller.findOne(
        mockRequest,
        1
      );

      expect(mockService.findOneForUser).toHaveBeenCalledWith(
        1,
        mockReaderUser.id
      );
      expect(result).toBe(mockNotification);
    });

    it('should propagate NotFoundException when notification does not exist', async (): Promise<void> => {
      mockUserService.getUserByGoogleWorkspaceUid.mockResolvedValue(
        mockAdminUser
      );
      mockService.findOne.mockRejectedValue(
        new NotFoundException('EmailNotification #99 not found')
      );

      await expect(controller.findOne(mockRequest, 99)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('remove', (): void => {
    it('should remove the notification', async (): Promise<void> => {
      mockService.remove.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(mockService.remove).toHaveBeenCalledWith(1);
    });

    it('should propagate NotFoundException when notification does not exist', async (): Promise<void> => {
      mockService.remove.mockRejectedValue(
        new NotFoundException('EmailNotification #99 not found')
      );

      await expect(controller.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
