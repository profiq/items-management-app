import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { LoansService } from './loans.service';
import { Loan } from './entities/loan.entity';
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

const mockRepository: jest.Mocked<
  Pick<Repository<Loan>, 'create' | 'save' | 'find' | 'findOneBy' | 'remove'>
> = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
  remove: jest.fn(),
};

describe('LoansService', (): void => {
  let service: LoansService;

  beforeEach(async (): Promise<void> => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoansService,
        {
          provide: getRepositoryToken(Loan),
          useValue: mockRepository,
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
      mockRepository.create.mockReturnValue(mockLoan);
      mockRepository.save.mockResolvedValue(mockLoan);

      const result: Loan = await service.create(dto);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          copy_id: 1,
          user_id: 1,
          due_date: '2026-04-15',
          returned_at: null,
          returned_by_user_id: null,
        })
      );
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ borrowed_at: expect.any(Date) as Date })
      );
      expect(mockRepository.save).toHaveBeenCalledWith(mockLoan);
      expect(result).toEqual(mockLoan);
    });
  });

  describe('findAll', (): void => {
    it('should return all loans', async (): Promise<void> => {
      const loans: Loan[] = [mockLoan];
      mockRepository.find.mockResolvedValue(loans);

      const result: Loan[] = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual(loans);
    });

    it('should return empty array when no loans exist', async (): Promise<void> => {
      mockRepository.find.mockResolvedValue([]);

      const result: Loan[] = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', (): void => {
    it('should return a loan by id', async (): Promise<void> => {
      mockRepository.findOneBy.mockResolvedValue(mockLoan);

      const result: Loan = await service.findOne(1);

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(mockLoan);
    });

    it('should throw NotFoundException when loan does not exist', async (): Promise<void> => {
      mockRepository.findOneBy.mockResolvedValue(null);

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
      mockRepository.findOneBy.mockResolvedValue(mockLoan);
      mockRepository.save.mockResolvedValue(updated);

      const result: Loan = await service.update(1, dto);

      expect(mockRepository.save).toHaveBeenCalledWith({
        ...mockLoan,
        returned_at: returnedAtDate,
        returned_by_user_id: 2,
      });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException when loan does not exist', async (): Promise<void> => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.update(99, { returned_at: '2026-04-10T12:00:00.000Z' })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', (): void => {
    it('should remove the loan', async (): Promise<void> => {
      mockRepository.findOneBy.mockResolvedValue(mockLoan);
      mockRepository.remove.mockResolvedValue(mockLoan);

      await service.remove(1);

      expect(mockRepository.remove).toHaveBeenCalledWith(mockLoan);
    });

    it('should throw NotFoundException when loan does not exist', async (): Promise<void> => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
