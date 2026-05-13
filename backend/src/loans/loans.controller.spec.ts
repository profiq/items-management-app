import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { LoansController } from './loans.controller';
import { LoansService } from './loans.service';
import { UserService } from '@/user/user.service';
import { AuthGuard } from '@/auth/auth.guard';
import { RolesGuard } from '@/auth/roles.guard';
import { Loan } from './entities/loan.entity';
import { User, UserRole } from '@/user/user.entity';
import { CreateLoanDto } from './dto/create-loan.dto';
import { ReturnLoanDto } from './dto/return-loan.dto';

type FirebaseRequest = { firebaseUser: DecodedIdToken };

const mockAdminUser: User = {
  id: 1,
  name: 'Admin',
  employee_id: 'emp1',
  role: UserRole.Admin,
};

const mockRegularUser: User = {
  id: 2,
  name: 'John',
  employee_id: 'emp2',
  role: UserRole.User,
};

const mockLoan: Loan = {
  id: 1,
  copy: { id: 1 } as Loan['copy'],
  copy_id: 1,
  user: mockRegularUser,
  user_id: 2,
  borrowed_at: new Date('2026-04-01T10:00:00Z'),
  due_date: '2026-04-15',
  returned_at: null,
  returned_by_user: null,
  returned_by_user_id: null,
};

const mockFirebaseReq = (): FirebaseRequest => ({
  firebaseUser: { uid: 'firebase-uid' } as DecodedIdToken,
});

const mockService: jest.Mocked<
  Pick<
    LoansService,
    | 'create'
    | 'findAll'
    | 'findAllForUser'
    | 'findOne'
    | 'findOneForUser'
    | 'update'
    | 'remove'
  >
> = {
  create: jest.fn(),
  findAll: jest.fn(),
  findAllForUser: jest.fn(),
  findOne: jest.fn(),
  findOneForUser: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockUserService: jest.Mocked<
  Pick<UserService, 'getUserByGoogleWorkspaceUid'>
> = {
  getUserByGoogleWorkspaceUid: jest.fn(),
};

describe('LoansController', (): void => {
  let controller: LoansController;

  beforeEach(async (): Promise<void> => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoansController],
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

    controller = module.get<LoansController>(LoansController);
    jest.clearAllMocks();
  });

  describe('create', (): void => {
    it('should create and return a loan', async (): Promise<void> => {
      const dto: CreateLoanDto = {
        copy_id: 1,
        user_id: 1,
        due_date: '2026-04-15',
      };
      mockService.create.mockResolvedValue(mockLoan);

      const result: Loan = await controller.create(dto);

      expect(mockService.create).toHaveBeenCalledWith(dto);
      expect(result).toBe(mockLoan);
    });
  });

  describe('findAll', (): void => {
    it('admin gets all loans', async (): Promise<void> => {
      const loans: Loan[] = [mockLoan];
      mockUserService.getUserByGoogleWorkspaceUid.mockResolvedValue(
        mockAdminUser
      );
      mockService.findAll.mockResolvedValue(loans);

      const result = await controller.findAll(mockFirebaseReq());

      expect(mockService.findAll).toHaveBeenCalled();
      expect(mockService.findAllForUser).not.toHaveBeenCalled();
      expect(result).toBe(loans);
    });

    it('regular user gets only their own loans', async (): Promise<void> => {
      const loans: Loan[] = [mockLoan];
      mockUserService.getUserByGoogleWorkspaceUid.mockResolvedValue(
        mockRegularUser
      );
      mockService.findAllForUser.mockResolvedValue(loans);

      const result = await controller.findAll(mockFirebaseReq());

      expect(mockService.findAllForUser).toHaveBeenCalledWith(
        mockRegularUser.id
      );
      expect(mockService.findAll).not.toHaveBeenCalled();
      expect(result).toBe(loans);
    });
  });

  describe('findOne', (): void => {
    it('admin gets any loan by id', async (): Promise<void> => {
      mockUserService.getUserByGoogleWorkspaceUid.mockResolvedValue(
        mockAdminUser
      );
      mockService.findOne.mockResolvedValue(mockLoan);

      const result = await controller.findOne(mockFirebaseReq(), '1');

      expect(mockService.findOne).toHaveBeenCalledWith(1);
      expect(mockService.findOneForUser).not.toHaveBeenCalled();
      expect(result).toBe(mockLoan);
    });

    it('regular user gets their own loan by id', async (): Promise<void> => {
      mockUserService.getUserByGoogleWorkspaceUid.mockResolvedValue(
        mockRegularUser
      );
      mockService.findOneForUser.mockResolvedValue(mockLoan);

      const result = await controller.findOne(mockFirebaseReq(), '1');

      expect(mockService.findOneForUser).toHaveBeenCalledWith(
        1,
        mockRegularUser.id
      );
      expect(mockService.findOne).not.toHaveBeenCalled();
      expect(result).toBe(mockLoan);
    });

    it('regular user gets NotFoundException for another user loan', async (): Promise<void> => {
      mockUserService.getUserByGoogleWorkspaceUid.mockResolvedValue(
        mockRegularUser
      );
      mockService.findOneForUser.mockRejectedValue(
        new NotFoundException('Loan #99 not found')
      );

      await expect(controller.findOne(mockFirebaseReq(), '99')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('update', (): void => {
    it('should update and return the loan', async (): Promise<void> => {
      const returnedAt = '2026-04-10T12:00:00.000Z';
      const dto: ReturnLoanDto = {
        returned_at: returnedAt,
        returned_by_user_id: 2,
      };
      const updated: Loan = {
        ...mockLoan,
        returned_at: new Date(returnedAt),
        returned_by_user_id: 2,
      };
      mockService.update.mockResolvedValue(updated);

      const result: Loan = await controller.update('1', dto);

      expect(mockService.update).toHaveBeenCalledWith(1, dto);
      expect(result).toBe(updated);
    });

    it('should propagate NotFoundException when loan does not exist', async (): Promise<void> => {
      mockService.update.mockRejectedValue(
        new NotFoundException('Loan #99 not found')
      );

      await expect(controller.update('99', {})).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('remove', (): void => {
    it('should remove the loan', async (): Promise<void> => {
      mockService.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(mockService.remove).toHaveBeenCalledWith(1);
    });

    it('should propagate NotFoundException when loan does not exist', async (): Promise<void> => {
      mockService.remove.mockRejectedValue(
        new NotFoundException('Loan #99 not found')
      );

      await expect(controller.remove('99')).rejects.toThrow(NotFoundException);
    });
  });
});
