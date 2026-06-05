import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { LoansController } from './loans.controller';
import { LoansService } from './loans.service';
import { UserService } from '@/user/user.service';
import { AuthGuard } from '@/auth/auth.guard';
import { RolesGuard } from '@/auth/roles.guard';
import { SlackNotificationsService } from '@/slack-notifications/slack-notifications.service';
import { Loan } from './entities/loan.entity';
import { BorrowLoanDto } from './dto/borrow-loan.dto';
import { UserRole } from '@/user/user.entity';

const mockLoan: Loan = {
  id: 1,
  copy: { id: 1 } as Loan['copy'],
  copy_id: 1,
  user: { id: 2, name: 'Alice', employee_id: 'emp2', role: UserRole.User },
  user_id: 2,
  borrowed_at: new Date('2026-05-01T10:00:00Z'),
  due_date: '2026-05-15',
  returned_at: null,
  returned_by_user: null,
  returned_by_user_id: null,
};

const mockUser = {
  id: 2,
  name: 'Alice',
  employee_id: 'emp2',
  role: UserRole.User,
};
const mockFirebaseReq = {
  firebaseUser: { uid: 'google-uid' } as DecodedIdToken,
};

const mockService: jest.Mocked<
  Pick<
    LoansService,
    'getMyLoans' | 'borrow' | 'findOne' | 'returnLoan' | 'borrowItem'
  >
> = {
  getMyLoans: jest.fn(),
  borrow: jest.fn(),
  findOne: jest.fn(),
  returnLoan: jest.fn(),
  borrowItem: jest.fn(),
};

const mockUserService: jest.Mocked<
  Pick<UserService, 'getUserByGoogleWorkspaceUid'>
> = {
  getUserByGoogleWorkspaceUid: jest.fn(),
};

const mockSlackNotificationsService: jest.Mocked<
  Pick<SlackNotificationsService, 'sendDueReminders'>
> = {
  sendDueReminders: jest.fn(),
};

describe('LoansController', (): void => {
  let controller: LoansController;

  beforeEach(async (): Promise<void> => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoansController],
      providers: [
        { provide: LoansService, useValue: mockService },
        { provide: UserService, useValue: mockUserService },
        {
          provide: SlackNotificationsService,
          useValue: mockSlackNotificationsService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();
    controller = module.get<LoansController>(LoansController);
    jest.clearAllMocks();
  });

  describe('POST /loans/trigger-due-reminders', (): void => {
    it('triggers due reminders via the slack notifications service', async (): Promise<void> => {
      mockSlackNotificationsService.sendDueReminders.mockResolvedValue(
        undefined
      );

      await controller.triggerDueReminders();

      expect(mockSlackNotificationsService.sendDueReminders).toHaveBeenCalled();
    });
  });

  describe('GET /loans/my', (): void => {
    it('returns current user loans', async (): Promise<void> => {
      mockUserService.getUserByGoogleWorkspaceUid.mockResolvedValue(mockUser);
      mockService.getMyLoans.mockResolvedValue([mockLoan]);

      const result = await controller.getMyLoans(mockFirebaseReq);

      expect(mockService.getMyLoans).toHaveBeenCalledWith(2);
      expect(result).toEqual([mockLoan]);
    });
  });

  describe('POST /loans', (): void => {
    it('creates a loan for the current user', async (): Promise<void> => {
      mockUserService.getUserByGoogleWorkspaceUid.mockResolvedValue(mockUser);
      mockService.borrow.mockResolvedValue(mockLoan);
      const dto: BorrowLoanDto = { copyId: 1 };

      const result = await controller.borrow(mockFirebaseReq, dto);

      expect(mockService.borrow).toHaveBeenCalledWith(1, 2);
      expect(result).toEqual(mockLoan);
    });
  });

  describe('PUT /loans/:id/return', (): void => {
    it('returns the loan when caller is the borrower', async (): Promise<void> => {
      mockUserService.getUserByGoogleWorkspaceUid.mockResolvedValue(mockUser);
      mockService.findOne.mockResolvedValue(mockLoan);
      const returned: Loan = {
        ...mockLoan,
        returned_at: new Date(),
        returned_by_user_id: 2,
      };
      mockService.returnLoan.mockResolvedValue(returned);

      const result = await controller.returnLoan(mockFirebaseReq, 1);

      expect(mockService.returnLoan).toHaveBeenCalledWith(1, 2);
      expect(result).toEqual(returned);
    });

    it('throws ForbiddenException when caller is not the borrower', async (): Promise<void> => {
      const otherUser = { ...mockUser, id: 99 };
      mockUserService.getUserByGoogleWorkspaceUid.mockResolvedValue(otherUser);
      mockService.findOne.mockResolvedValue(mockLoan);

      await expect(controller.returnLoan(mockFirebaseReq, 1)).rejects.toThrow(
        ForbiddenException
      );
      expect(mockService.returnLoan).not.toHaveBeenCalled();
    });

    it('propagates NotFoundException when loan does not exist', async (): Promise<void> => {
      mockUserService.getUserByGoogleWorkspaceUid.mockResolvedValue(mockUser);
      mockService.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.returnLoan(mockFirebaseReq, 99)).rejects.toThrow(
        NotFoundException
      );
    });

    it('propagates ConflictException when loan is already returned', async (): Promise<void> => {
      mockUserService.getUserByGoogleWorkspaceUid.mockResolvedValue(mockUser);
      mockService.findOne.mockResolvedValue(mockLoan);
      mockService.returnLoan.mockRejectedValue(new ConflictException());

      await expect(controller.returnLoan(mockFirebaseReq, 1)).rejects.toThrow(
        ConflictException
      );
    });
  });

  describe('POST /loans/borrow-item/:itemId', (): void => {
    it('borrows an item for the current user', async (): Promise<void> => {
      mockUserService.getUserByGoogleWorkspaceUid.mockResolvedValue(mockUser);
      mockService.borrowItem.mockResolvedValue(mockLoan);

      const result = await controller.borrowItem(mockFirebaseReq, 1);

      expect(mockService.borrowItem).toHaveBeenCalledWith(1, 2);
      expect(result).toEqual(mockLoan);
    });

    it('propagates UnprocessableEntityException when no copy available', async (): Promise<void> => {
      mockUserService.getUserByGoogleWorkspaceUid.mockResolvedValue(mockUser);
      mockService.borrowItem.mockRejectedValue(
        new UnprocessableEntityException('No available copy for this item')
      );

      await expect(controller.borrowItem(mockFirebaseReq, 99)).rejects.toThrow(
        UnprocessableEntityException
      );
    });
  });
});
