import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IsNull, LessThan, MoreThanOrEqual, Not, Repository } from 'typeorm';
import { LoansService } from './loans.service';
import { Loan } from './entities/loan.entity';
import { ItemCopy } from '@/item-copies/entities/item-copy.entity';
import { UserRole } from '@/user/user.entity';
import { FindLoansQueryDto, LoanStatus } from './dto/find-loans-query.dto';

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

const mockCopy = {
  id: 1,
  item_id: 1,
  item: { id: 1, default_loan_days: 14 },
  location_id: 1,
  condition: 'good',
  archived_at: null,
} as unknown as ItemCopy;

const mockLoanRepository: jest.Mocked<
  Pick<Repository<Loan>, 'create' | 'save' | 'find' | 'findOneBy' | 'findOne'>
> = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
  findOne: jest.fn(),
};

const mockItemCopyRepository: jest.Mocked<
  Pick<Repository<ItemCopy>, 'findOne'>
> = {
  findOne: jest.fn(),
};

describe('LoansService', (): void => {
  let service: LoansService;

  beforeEach(async (): Promise<void> => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoansService,
        { provide: getRepositoryToken(Loan), useValue: mockLoanRepository },
        {
          provide: getRepositoryToken(ItemCopy),
          useValue: mockItemCopyRepository,
        },
      ],
    }).compile();
    service = module.get<LoansService>(LoansService);
    jest.clearAllMocks();
  });

  describe('findOne', (): void => {
    it('returns a loan by id', async (): Promise<void> => {
      mockLoanRepository.findOneBy.mockResolvedValue(mockLoan);
      const result = await service.findOne(1);
      expect(mockLoanRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(mockLoan);
    });

    it('throws NotFoundException when loan does not exist', async (): Promise<void> => {
      mockLoanRepository.findOneBy.mockResolvedValue(null);
      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('borrow', (): void => {
    it('creates a loan with auto-calculated due_date', async (): Promise<void> => {
      mockItemCopyRepository.findOne.mockResolvedValue(mockCopy);
      mockLoanRepository.findOne.mockResolvedValue(null);
      mockLoanRepository.create.mockReturnValue(mockLoan);
      mockLoanRepository.save.mockResolvedValue(mockLoan);

      const result = await service.borrow(1, 2);

      expect(mockItemCopyRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['item'],
      });
      expect(mockLoanRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          copy_id: 1,
          user_id: 2,
          returned_at: null,
          returned_by_user_id: null,
        })
      );
      expect(result).toEqual(mockLoan);
    });

    it('throws NotFoundException when copy does not exist', async (): Promise<void> => {
      mockItemCopyRepository.findOne.mockResolvedValue(null);
      await expect(service.borrow(99, 2)).rejects.toThrow(NotFoundException);
    });

    it('throws UnprocessableEntityException when copy is archived', async (): Promise<void> => {
      mockItemCopyRepository.findOne.mockResolvedValue({
        ...mockCopy,
        archived_at: new Date(),
      } as unknown as ItemCopy);
      await expect(service.borrow(1, 2)).rejects.toThrow(
        UnprocessableEntityException
      );
    });

    it('throws ConflictException when copy already has an active loan', async (): Promise<void> => {
      mockItemCopyRepository.findOne.mockResolvedValue(mockCopy);
      mockLoanRepository.findOne.mockResolvedValue(mockLoan);
      await expect(service.borrow(1, 2)).rejects.toThrow(ConflictException);
    });

    it('maps the active-loan unique constraint to ConflictException', async (): Promise<void> => {
      mockItemCopyRepository.findOne.mockResolvedValue(mockCopy);
      mockLoanRepository.findOne.mockResolvedValue(null);
      mockLoanRepository.create.mockReturnValue(mockLoan);
      mockLoanRepository.save.mockRejectedValue(
        new Error('SQLITE_CONSTRAINT: UNIQUE constraint failed: loan.copy_id')
      );

      await expect(service.borrow(1, 2)).rejects.toThrow(ConflictException);
    });
  });

  describe('getMyLoans', (): void => {
    it('returns all loans for a user ordered by borrowed_at DESC', async (): Promise<void> => {
      mockLoanRepository.find.mockResolvedValue([mockLoan]);
      const result = await service.getMyLoans(2);
      expect(mockLoanRepository.find).toHaveBeenCalledWith({
        where: { user_id: 2 },
        order: { borrowed_at: 'DESC' },
      });
      expect(result).toEqual([mockLoan]);
    });
  });

  describe('returnLoan', (): void => {
    it('marks loan as returned', async (): Promise<void> => {
      mockLoanRepository.findOneBy.mockResolvedValue(mockLoan);
      const returned: Loan = {
        ...mockLoan,
        returned_at: new Date(),
        returned_by_user_id: 3,
      };
      mockLoanRepository.save.mockResolvedValue(returned);

      const result = await service.returnLoan(1, 3);

      expect(mockLoanRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          returned_by_user_id: 3,
          returned_at: expect.any(Date) as Date,
        })
      );
      expect(result).toEqual(returned);
    });

    it('throws NotFoundException when loan does not exist', async (): Promise<void> => {
      mockLoanRepository.findOneBy.mockResolvedValue(null);
      await expect(service.returnLoan(99, 3)).rejects.toThrow(
        NotFoundException
      );
    });

    it('throws ConflictException when loan is already returned', async (): Promise<void> => {
      mockLoanRepository.findOneBy.mockResolvedValue({
        ...mockLoan,
        returned_at: new Date(),
      });
      await expect(service.returnLoan(1, 3)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', (): void => {
    it('returns all loans when no status filter', async (): Promise<void> => {
      mockLoanRepository.find.mockResolvedValue([mockLoan]);
      const result = await service.findAll({} as FindLoansQueryDto);
      expect(mockLoanRepository.find).toHaveBeenCalledWith();
      expect(result).toEqual([mockLoan]);
    });

    it('filters active loans (not returned, due_date >= today)', async (): Promise<void> => {
      mockLoanRepository.find.mockResolvedValue([mockLoan]);
      await service.findAll({ status: LoanStatus.Active });
      expect(mockLoanRepository.find).toHaveBeenCalledWith({
        where: {
          returned_at: IsNull(),
          due_date: MoreThanOrEqual(expect.any(String)),
        },
      });
    });

    it('filters returned loans', async (): Promise<void> => {
      mockLoanRepository.find.mockResolvedValue([]);
      await service.findAll({ status: LoanStatus.Returned });
      expect(mockLoanRepository.find).toHaveBeenCalledWith({
        where: { returned_at: Not(IsNull()) },
      });
    });

    it('filters overdue loans (not returned, due_date < today)', async (): Promise<void> => {
      mockLoanRepository.find.mockResolvedValue([]);
      await service.findAll({ status: LoanStatus.Overdue });
      expect(mockLoanRepository.find).toHaveBeenCalledWith({
        where: {
          returned_at: IsNull(),
          due_date: LessThan(expect.any(String)),
        },
      });
    });
  });

  describe('extendLoan', (): void => {
    it('extends due_date by given number of days', async (): Promise<void> => {
      mockLoanRepository.findOneBy.mockResolvedValue({
        ...mockLoan,
        due_date: '2026-05-15',
        returned_at: null,
      });
      const extended: Loan = { ...mockLoan, due_date: '2026-05-29' };
      mockLoanRepository.save.mockResolvedValue(extended);

      const result = await service.extendLoan(1, 14);

      expect(mockLoanRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ due_date: '2026-05-29' })
      );
      expect(result).toEqual(extended);
    });

    it('throws BadRequestException when dueDays is not positive', async (): Promise<void> => {
      await expect(service.extendLoan(1, 0)).rejects.toThrow(
        BadRequestException
      );
      expect(mockLoanRepository.findOneBy).not.toHaveBeenCalled();
      expect(mockLoanRepository.save).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when loan does not exist', async (): Promise<void> => {
      mockLoanRepository.findOneBy.mockResolvedValue(null);
      await expect(service.extendLoan(99, 7)).rejects.toThrow(
        NotFoundException
      );
    });

    it('throws ConflictException when loan is already returned', async (): Promise<void> => {
      mockLoanRepository.findOneBy.mockResolvedValue({
        ...mockLoan,
        returned_at: new Date(),
      });
      await expect(service.extendLoan(1, 7)).rejects.toThrow(ConflictException);
    });
  });
});
