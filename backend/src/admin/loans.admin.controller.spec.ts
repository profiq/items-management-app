import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { LoansAdminController } from './loans.admin.controller';
import { LoansService } from '@/loans/loans.service';
import { UserService } from '@/user/user.service';
import { AuthGuard } from '@/auth/auth.guard';
import { RolesGuard } from '@/auth/roles.guard';
import { Loan } from '@/loans/entities/loan.entity';
import {
  FindLoansQueryDto,
  LoanStatus,
} from '@/loans/dto/find-loans-query.dto';
import { ExtendLoanDto } from '@/loans/dto/extend-loan.dto';
import { UserRole } from '@/user/user.entity';
import { UnknownUserException } from '@/lib/errors';

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

const mockAdmin = {
  id: 3,
  name: 'Admin',
  employee_id: 'adm1',
  role: UserRole.Admin,
};
const mockFirebaseReq = {
  firebaseUser: { uid: 'google-uid' } as DecodedIdToken,
};

const mockService: jest.Mocked<
  Pick<LoansService, 'findAll' | 'returnLoan' | 'extendLoan'>
> = {
  findAll: jest.fn(),
  returnLoan: jest.fn(),
  extendLoan: jest.fn(),
};

const mockUserService: jest.Mocked<
  Pick<UserService, 'getUserByGoogleWorkspaceUid'>
> = {
  getUserByGoogleWorkspaceUid: jest.fn(),
};

describe('LoansAdminController', (): void => {
  let controller: LoansAdminController;

  beforeEach(async (): Promise<void> => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoansAdminController],
      providers: [
        { provide: LoansService, useValue: mockService },
        { provide: UserService, useValue: mockUserService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();
    controller = module.get<LoansAdminController>(LoansAdminController);
    jest.clearAllMocks();
  });

  describe('GET /admin/loans', (): void => {
    it('returns all loans without filter', async (): Promise<void> => {
      mockService.findAll.mockResolvedValue([mockLoan]);
      const result = await controller.findAll({} as FindLoansQueryDto);
      expect(mockService.findAll).toHaveBeenCalledWith({});
      expect(result).toEqual([mockLoan]);
    });

    it('passes status filter to service', async (): Promise<void> => {
      mockService.findAll.mockResolvedValue([]);
      await controller.findAll({ status: LoanStatus.Active });
      expect(mockService.findAll).toHaveBeenCalledWith({
        status: LoanStatus.Active,
      });
    });
  });

  describe('PUT /admin/loans/:id/return', (): void => {
    it('returns loan on behalf of user', async (): Promise<void> => {
      mockUserService.getUserByGoogleWorkspaceUid.mockResolvedValue(mockAdmin);
      const returned: Loan = {
        ...mockLoan,
        returned_at: new Date(),
        returned_by_user_id: 3,
      };
      mockService.returnLoan.mockResolvedValue(returned);

      const result = await controller.returnLoan(mockFirebaseReq, 1);

      expect(mockService.returnLoan).toHaveBeenCalledWith(1, 3);
      expect(result).toEqual(returned);
    });

    it('propagates NotFoundException when loan does not exist', async (): Promise<void> => {
      mockUserService.getUserByGoogleWorkspaceUid.mockResolvedValue(mockAdmin);
      mockService.returnLoan.mockRejectedValue(new NotFoundException());
      await expect(controller.returnLoan(mockFirebaseReq, 99)).rejects.toThrow(
        NotFoundException
      );
    });

    it('throws UnknownUserException when firebase user is not found in DB', async (): Promise<void> => {
      mockUserService.getUserByGoogleWorkspaceUid.mockResolvedValue(null);
      await expect(controller.returnLoan(mockFirebaseReq, 1)).rejects.toThrow(
        UnknownUserException
      );
      expect(mockService.returnLoan).not.toHaveBeenCalled();
    });
  });

  describe('PUT /admin/loans/:id/extend', (): void => {
    it('extends loan due date', async (): Promise<void> => {
      const extended: Loan = { ...mockLoan, due_date: '2026-05-29' };
      mockService.extendLoan.mockResolvedValue(extended);
      const dto: ExtendLoanDto = { dueDays: 14 };

      const result = await controller.extendLoan(1, dto);

      expect(mockService.extendLoan).toHaveBeenCalledWith(1, 14);
      expect(result).toEqual(extended);
    });

    it('propagates NotFoundException when loan does not exist', async (): Promise<void> => {
      mockService.extendLoan.mockRejectedValue(new NotFoundException());
      await expect(controller.extendLoan(99, { dueDays: 7 })).rejects.toThrow(
        NotFoundException
      );
    });
  });
});
