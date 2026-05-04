import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { LoansController } from './loans.controller';
import { LoansService } from './loans.service';
import { AuthGuard } from '@/auth/auth.guard';
import { RolesGuard } from '@/auth/roles.guard';
import { Loan } from './entities/loan.entity';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { UserRole } from '@/user/user.entity';

const mockLoan: Loan = {
  id: 1,
  copy: { id: 1 } as Loan['copy'],
  copy_id: 1,
  user: {
    id: 1,
    name: 'John',
    employee_id: 'emp1',
    role: UserRole.User,
  },
  user_id: 1,
  borrowed_at: new Date('2026-04-01T10:00:00Z'),
  due_date: '2026-04-15',
  returned_at: null,
  returned_by_user: null,
  returned_by_user_id: null,
};

const mockService: jest.Mocked<
  Pick<LoansService, 'create' | 'findAll' | 'findOne' | 'update' | 'remove'>
> = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('LoansController', (): void => {
  let controller: LoansController;

  beforeEach(async (): Promise<void> => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoansController],
      providers: [
        {
          provide: LoansService,
          useValue: mockService,
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
    it('should return all loans', async (): Promise<void> => {
      const loans: Loan[] = [mockLoan];
      mockService.findAll.mockResolvedValue(loans);

      const result: Loan[] = await controller.findAll();

      expect(mockService.findAll).toHaveBeenCalled();
      expect(result).toBe(loans);
    });
  });

  describe('findOne', (): void => {
    it('should return a loan by id', async (): Promise<void> => {
      mockService.findOne.mockResolvedValue(mockLoan);

      const result: Loan = await controller.findOne('1');

      expect(mockService.findOne).toHaveBeenCalledWith(1);
      expect(result).toBe(mockLoan);
    });

    it('should propagate NotFoundException when loan does not exist', async (): Promise<void> => {
      mockService.findOne.mockRejectedValue(
        new NotFoundException('Loan #99 not found')
      );

      await expect(controller.findOne('99')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', (): void => {
    it('should update and return the loan', async (): Promise<void> => {
      const returnedAt = new Date('2026-04-10T12:00:00Z');
      const dto: UpdateLoanDto = {
        returned_at: returnedAt,
        returned_by_user_id: 2,
      };
      const updated: Loan = {
        ...mockLoan,
        returned_at: returnedAt,
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
