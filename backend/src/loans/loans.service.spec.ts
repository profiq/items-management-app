import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { QueryFailedError, Repository } from 'typeorm';
import { LoansService } from './loans.service';
import { Loan } from './entities/loan.entity';
import { ItemCopy } from '@/item-copies/entities/item-copy.entity';
import { CreateLoanDto } from './dto/create-loan.dto';
import { ReturnLoanDto } from './dto/return-loan.dto';
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

const mockItemCopy = { id: 1 } as ItemCopy;

const mockLoanRepository: jest.Mocked<
  Pick<
    Repository<Loan>,
    'create' | 'save' | 'find' | 'findBy' | 'findOneBy' | 'remove'
  >
> = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findBy: jest.fn(),
  findOneBy: jest.fn(),
  remove: jest.fn(),
};

const mockItemCopyRepository: jest.Mocked<
  Pick<Repository<ItemCopy>, 'findOneBy'>
> = {
  findOneBy: jest.fn(),
};

describe('LoansService', (): void => {
  let service: LoansService;

  beforeEach(async (): Promise<void> => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoansService,
        {
          provide: getRepositoryToken(Loan),
          useValue: mockLoanRepository,
        },
        {
          provide: getRepositoryToken(ItemCopy),
          useValue: mockItemCopyRepository,
        },
      ],
    }).compile();

    service = module.get<LoansService>(LoansService);
    jest.clearAllMocks();
  });

  describe('create', (): void => {
    it('should create and return a loan with borrowed_at set to now', async (): Promise<void> => {
      const dto: CreateLoanDto = {
        copy_id: 1,
        user_id: 1,
        due_date: '2026-04-15',
      };
      mockItemCopyRepository.findOneBy.mockResolvedValue(mockItemCopy);
      mockLoanRepository.findOneBy.mockResolvedValue(null);
      mockLoanRepository.create.mockReturnValue(mockLoan);
      mockLoanRepository.save.mockResolvedValue(mockLoan);

      const result: Loan = await service.create(dto);

      expect(mockLoanRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          copy_id: 1,
          user_id: 1,
          due_date: '2026-04-15',
          returned_at: null,
          returned_by_user_id: null,
        })
      );
      expect(mockLoanRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ borrowed_at: expect.any(Date) as Date })
      );
      expect(mockLoanRepository.save).toHaveBeenCalledWith(mockLoan);
      expect(result).toEqual(mockLoan);
    });

    it('should throw NotFoundException when copy does not exist or is archived', async (): Promise<void> => {
      mockItemCopyRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.create({ copy_id: 99, user_id: 1, due_date: '2026-04-15' })
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when copy is already on loan', async (): Promise<void> => {
      mockItemCopyRepository.findOneBy.mockResolvedValue(mockItemCopy);
      mockLoanRepository.findOneBy.mockResolvedValue(mockLoan);

      await expect(
        service.create({ copy_id: 1, user_id: 1, due_date: '2026-04-15' })
      ).rejects.toThrow(ConflictException);
    });

    it('should convert unique-violation from save into ConflictException', async (): Promise<void> => {
      mockItemCopyRepository.findOneBy.mockResolvedValue(mockItemCopy);
      mockLoanRepository.findOneBy.mockResolvedValue(null);
      mockLoanRepository.create.mockReturnValue(mockLoan);

      const driverError = Object.assign(new Error('UNIQUE constraint failed'), {
        code: 'SQLITE_CONSTRAINT',
      });
      const queryError = new QueryFailedError(
        'INSERT INTO loan',
        [],
        driverError
      );
      mockLoanRepository.save.mockRejectedValue(queryError);

      await expect(
        service.create({ copy_id: 1, user_id: 1, due_date: '2026-04-15' })
      ).rejects.toThrow(ConflictException);
    });

    it('should rethrow non-unique-violation errors from save unchanged', async (): Promise<void> => {
      mockItemCopyRepository.findOneBy.mockResolvedValue(mockItemCopy);
      mockLoanRepository.findOneBy.mockResolvedValue(null);
      mockLoanRepository.create.mockReturnValue(mockLoan);

      const unexpected = new Error('boom');
      mockLoanRepository.save.mockRejectedValue(unexpected);

      await expect(
        service.create({ copy_id: 1, user_id: 1, due_date: '2026-04-15' })
      ).rejects.toBe(unexpected);
    });
  });

  describe('findAll', (): void => {
    it('should return all loans', async (): Promise<void> => {
      const loans: Loan[] = [mockLoan];
      mockLoanRepository.find.mockResolvedValue(loans);

      const result: Loan[] = await service.findAll();

      expect(mockLoanRepository.find).toHaveBeenCalled();
      expect(result).toEqual(loans);
    });

    it('should return empty array when no loans exist', async (): Promise<void> => {
      mockLoanRepository.find.mockResolvedValue([]);

      const result: Loan[] = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', (): void => {
    it('should return a loan by id', async (): Promise<void> => {
      mockLoanRepository.findOneBy.mockResolvedValue(mockLoan);

      const result: Loan = await service.findOne(1);

      expect(mockLoanRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(mockLoan);
    });

    it('should throw NotFoundException when loan does not exist', async (): Promise<void> => {
      mockLoanRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(99)).rejects.toThrow('Loan #99 not found');
    });
  });

  describe('update', (): void => {
    it('should mark loan as returned', async (): Promise<void> => {
      const returnedAt = '2026-04-10T12:00:00.000Z';
      const returnedAtDate = new Date(returnedAt);
      const dto: ReturnLoanDto = {
        returned_at: returnedAt,
        returned_by_user_id: 2,
      };
      const updated: Loan = {
        ...mockLoan,
        returned_at: returnedAtDate,
        returned_by_user_id: 2,
      };
      mockLoanRepository.findOneBy.mockResolvedValue(mockLoan);
      mockLoanRepository.save.mockResolvedValue(updated);

      const result: Loan = await service.update(1, dto);

      expect(mockLoanRepository.save).toHaveBeenCalledWith({
        ...mockLoan,
        returned_at: returnedAtDate,
        returned_by_user_id: 2,
      });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException when loan does not exist', async (): Promise<void> => {
      mockLoanRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.update(99, { returned_at: '2026-04-10T12:00:00.000Z' })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', (): void => {
    it('should remove the loan', async (): Promise<void> => {
      mockLoanRepository.findOneBy.mockResolvedValue(mockLoan);
      mockLoanRepository.remove.mockResolvedValue(mockLoan);

      await service.remove(1);

      expect(mockLoanRepository.remove).toHaveBeenCalledWith(mockLoan);
    });

    it('should throw NotFoundException when loan does not exist', async (): Promise<void> => {
      mockLoanRepository.findOneBy.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
