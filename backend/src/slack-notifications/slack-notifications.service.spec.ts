import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SlackNotificationsService } from './slack-notifications.service';
import {
  SlackNotification,
  SlackNotificationType,
} from './entities/slack-notification.entity';
import { SlackService } from '@/slack/slack.service';
import { UserService } from '@/user/user.service';
import { EmployeeService } from '@/employee/employee.service';
import { Loan } from '@/loans/entities/loan.entity';
import { ItemCopy } from '@/item-copies/entities/item-copy.entity';
import { UserRole } from '@/user/user.entity';

const mockUser = {
  id: 2,
  name: 'Alice',
  employee_id: 'emp-123',
  role: UserRole.User,
};
const mockEmployee = {
  id: 'emp-123',
  name: 'Alice',
  email: 'alice@profiq.com',
  photoUrl: '',
};
const mockLoan = {
  id: 1,
  copy_id: 1,
  user_id: 2,
  borrowed_at: new Date('2026-05-22T10:00:00Z'),
  due_date: '2026-06-05',
  returned_at: null,
  returned_by_user_id: null,
} as unknown as Loan;

const mockCopy = { id: 1, item: { id: 1, name: 'MacBook Pro' } };

const mockNotificationRecord: SlackNotification = {
  id: 1,
  loan: mockLoan,
  loan_id: 1,
  type: SlackNotificationType.LoanStarted,
  sent_at: new Date(),
};

const mockSlackNotificationRepository: jest.Mocked<
  Pick<Repository<SlackNotification>, 'create' | 'save' | 'findOneBy'>
> = {
  create: jest.fn(),
  save: jest.fn(),
  findOneBy: jest.fn(),
};

const mockLoanRepository: jest.Mocked<
  Pick<Repository<Loan>, 'createQueryBuilder'>
> = {
  createQueryBuilder: jest.fn(),
};

const mockSlackService: jest.Mocked<Pick<SlackService, 'sendDm'>> = {
  sendDm: jest.fn(),
};

const mockUserService: jest.Mocked<Pick<UserService, 'getUserById'>> = {
  getUserById: jest.fn(),
};

const mockEmployeeService: jest.Mocked<Pick<EmployeeService, 'getEmployee'>> = {
  getEmployee: jest.fn(),
};

describe('SlackNotificationsService', (): void => {
  let service: SlackNotificationsService;

  beforeEach(async (): Promise<void> => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SlackNotificationsService,
        {
          provide: getRepositoryToken(SlackNotification),
          useValue: mockSlackNotificationRepository,
        },
        {
          provide: getRepositoryToken(Loan),
          useValue: mockLoanRepository,
        },
        { provide: SlackService, useValue: mockSlackService },
        { provide: UserService, useValue: mockUserService },
        { provide: EmployeeService, useValue: mockEmployeeService },
      ],
    }).compile();

    service = module.get<SlackNotificationsService>(SlackNotificationsService);
    jest.clearAllMocks();
  });

  describe('notifyLoanStarted', (): void => {
    it('sends DM with item name and due date, saves notification', async (): Promise<void> => {
      mockUserService.getUserById.mockResolvedValue(mockUser);
      mockEmployeeService.getEmployee.mockResolvedValue(mockEmployee);
      mockSlackService.sendDm.mockResolvedValue(undefined);
      mockSlackNotificationRepository.create.mockReturnValue(
        mockNotificationRecord
      );
      mockSlackNotificationRepository.save.mockResolvedValue(
        mockNotificationRecord
      );

      await service.notifyLoanStarted(
        mockLoan,
        mockCopy as unknown as ItemCopy
      );

      expect(mockSlackService.sendDm).toHaveBeenCalledWith(
        'alice@profiq.com',
        'Půjčil/a sis MacBook Pro. Termín vrácení: 2026-06-05.'
      );
      expect(mockSlackNotificationRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          loan_id: 1,
          type: SlackNotificationType.LoanStarted,
          sent_at: expect.any(Date) as Date,
        })
      );
      expect(mockSlackNotificationRepository.save).toHaveBeenCalledWith(
        mockNotificationRecord
      );
    });

    it('does not save notification and does not throw when SlackService fails', async (): Promise<void> => {
      mockUserService.getUserById.mockResolvedValue(mockUser);
      mockEmployeeService.getEmployee.mockResolvedValue(mockEmployee);
      mockSlackService.sendDm.mockRejectedValue(new Error('Slack API error'));

      await expect(
        service.notifyLoanStarted(mockLoan, mockCopy as unknown as ItemCopy)
      ).resolves.not.toThrow();

      expect(mockSlackNotificationRepository.save).not.toHaveBeenCalled();
    });

    it('skips silently when user not found in database', async (): Promise<void> => {
      mockUserService.getUserById.mockResolvedValue(null);

      await service.notifyLoanStarted(
        mockLoan,
        mockCopy as unknown as ItemCopy
      );

      expect(mockSlackService.sendDm).not.toHaveBeenCalled();
      expect(mockSlackNotificationRepository.save).not.toHaveBeenCalled();
    });

    it('skips silently when employee not found in directory', async (): Promise<void> => {
      mockUserService.getUserById.mockResolvedValue(mockUser);
      mockEmployeeService.getEmployee.mockResolvedValue(null);

      await service.notifyLoanStarted(
        mockLoan,
        mockCopy as unknown as ItemCopy
      );

      expect(mockSlackService.sendDm).not.toHaveBeenCalled();
    });
  });

  describe('sendDueReminders', (): void => {
    function makeLoanQB(
      loans: unknown[]
    ): ReturnType<Repository<Loan>['createQueryBuilder']> {
      return {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(loans),
      } as unknown as ReturnType<Repository<Loan>['createQueryBuilder']>;
    }

    it('sends reminder_7 for a loan due in 7 days when not already sent', async (): Promise<void> => {
      const loanDue7 = {
        ...mockLoan,
        copy: { id: 1, item: { id: 1, name: 'MacBook Pro' } },
      };
      mockLoanRepository.createQueryBuilder
        .mockReturnValueOnce(makeLoanQB([loanDue7]))
        .mockReturnValueOnce(makeLoanQB([]))
        .mockReturnValueOnce(makeLoanQB([]));

      mockSlackNotificationRepository.findOneBy.mockResolvedValue(null);
      mockUserService.getUserById.mockResolvedValue(mockUser);
      mockEmployeeService.getEmployee.mockResolvedValue(mockEmployee);
      mockSlackService.sendDm.mockResolvedValue(undefined);
      const reminder7Record = {
        ...mockNotificationRecord,
        type: SlackNotificationType.Reminder7,
      };
      mockSlackNotificationRepository.create.mockReturnValue(reminder7Record);
      mockSlackNotificationRepository.save.mockResolvedValue(reminder7Record);

      await service.sendDueReminders();

      expect(mockSlackService.sendDm).toHaveBeenCalledTimes(1);
      expect(mockSlackService.sendDm).toHaveBeenCalledWith(
        'alice@profiq.com',
        'Připomínka: termín vrácení MacBook Pro je za 7 dní (2026-06-05).'
      );
    });

    it('sends reminder_1 with "zítra" wording', async (): Promise<void> => {
      const loanDue1 = {
        ...mockLoan,
        copy: { id: 1, item: { id: 1, name: 'iPad' } },
      };
      mockLoanRepository.createQueryBuilder
        .mockReturnValueOnce(makeLoanQB([]))
        .mockReturnValueOnce(makeLoanQB([]))
        .mockReturnValueOnce(makeLoanQB([loanDue1]));

      mockSlackNotificationRepository.findOneBy.mockResolvedValue(null);
      mockUserService.getUserById.mockResolvedValue(mockUser);
      mockEmployeeService.getEmployee.mockResolvedValue(mockEmployee);
      mockSlackService.sendDm.mockResolvedValue(undefined);
      const reminder1Record = {
        ...mockNotificationRecord,
        type: SlackNotificationType.Reminder1,
      };
      mockSlackNotificationRepository.create.mockReturnValue(reminder1Record);
      mockSlackNotificationRepository.save.mockResolvedValue(reminder1Record);

      await service.sendDueReminders();

      expect(mockSlackService.sendDm).toHaveBeenCalledWith(
        'alice@profiq.com',
        'Připomínka: termín vrácení iPad je zítra (2026-06-05).'
      );
    });

    it('sends reminder_3 with correct wording', async (): Promise<void> => {
      const loanDue3 = {
        ...mockLoan,
        copy: { id: 1, item: { id: 1, name: 'Keyboard' } },
      };
      mockLoanRepository.createQueryBuilder
        .mockReturnValueOnce(makeLoanQB([]))
        .mockReturnValueOnce(makeLoanQB([loanDue3]))
        .mockReturnValueOnce(makeLoanQB([]));

      mockSlackNotificationRepository.findOneBy.mockResolvedValue(null);
      mockUserService.getUserById.mockResolvedValue(mockUser);
      mockEmployeeService.getEmployee.mockResolvedValue(mockEmployee);
      mockSlackService.sendDm.mockResolvedValue(undefined);
      const reminder3Record = {
        ...mockNotificationRecord,
        type: SlackNotificationType.Reminder3,
      };
      mockSlackNotificationRepository.create.mockReturnValue(reminder3Record);
      mockSlackNotificationRepository.save.mockResolvedValue(reminder3Record);

      await service.sendDueReminders();

      expect(mockSlackService.sendDm).toHaveBeenCalledWith(
        'alice@profiq.com',
        'Připomínka: termín vrácení Keyboard je za 3 dny (2026-06-05).'
      );
    });

    it('skips loan when reminder already sent (deduplication)', async (): Promise<void> => {
      const loanDue1 = {
        ...mockLoan,
        copy: { id: 1, item: { id: 1, name: 'MacBook Pro' } },
      };
      mockLoanRepository.createQueryBuilder
        .mockReturnValueOnce(makeLoanQB([]))
        .mockReturnValueOnce(makeLoanQB([]))
        .mockReturnValueOnce(makeLoanQB([loanDue1]));

      mockSlackNotificationRepository.findOneBy.mockResolvedValue({
        ...mockNotificationRecord,
        type: SlackNotificationType.Reminder1,
      });

      await service.sendDueReminders();

      expect(mockSlackService.sendDm).not.toHaveBeenCalled();
    });

    it('does not throw when a single reminder fails', async (): Promise<void> => {
      const loanDue7 = {
        ...mockLoan,
        copy: { id: 1, item: { id: 1, name: 'MacBook Pro' } },
      };
      mockLoanRepository.createQueryBuilder
        .mockReturnValueOnce(makeLoanQB([loanDue7]))
        .mockReturnValueOnce(makeLoanQB([]))
        .mockReturnValueOnce(makeLoanQB([]));

      mockSlackNotificationRepository.findOneBy.mockResolvedValue(null);
      mockUserService.getUserById.mockRejectedValue(new Error('DB error'));

      await expect(service.sendDueReminders()).resolves.not.toThrow();
    });
  });
});
