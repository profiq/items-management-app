import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IsNull,
  LessThan,
  MoreThanOrEqual,
  Not,
  QueryFailedError,
  Repository,
} from 'typeorm';
import { ItemCopy } from '@/item-copies/entities/item-copy.entity';
import { FindLoansQueryDto, LoanStatus } from './dto/find-loans-query.dto';
import { Loan } from './entities/loan.entity';

const UNIQUE_VIOLATION_CODES = new Set([
  'SQLITE_CONSTRAINT',
  'SQLITE_CONSTRAINT_UNIQUE',
  'ER_DUP_ENTRY',
  '23505',
]);

function isUniqueViolation(error: unknown): boolean {
  if (!(error instanceof QueryFailedError)) return false;
  const driver = error.driverError as { code?: string } | undefined;
  return !!driver?.code && UNIQUE_VIOLATION_CODES.has(driver.code);
}

@Injectable()
export class LoansService {
  constructor(
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
    @InjectRepository(ItemCopy)
    private readonly itemCopyRepository: Repository<ItemCopy>
  ) {}

  async findOne(id: number): Promise<Loan> {
    const loan = await this.loanRepository.findOneBy({ id });
    if (!loan) throw new NotFoundException(`Loan #${id} not found`);
    return loan;
  }

  async borrow(copyId: number, userId: number): Promise<Loan> {
    const copy = await this.itemCopyRepository.findOne({
      where: { id: copyId },
      relations: ['item'],
    });
    if (!copy) throw new NotFoundException(`ItemCopy #${copyId} not found`);
    if (copy.archived_at !== null) {
      throw new UnprocessableEntityException('Copy is archived');
    }

    const activeLoan = await this.loanRepository.findOne({
      where: { copy_id: copyId, returned_at: IsNull() },
    });
    if (activeLoan) throw new ConflictException('Copy is already on loan');

    const dueDate = this.addDays(this.today(), copy.item.default_loan_days);
    const loan = this.loanRepository.create({
      copy_id: copyId,
      user_id: userId,
      borrowed_at: new Date(),
      due_date: dueDate,
      returned_at: null,
      returned_by_user_id: null,
    });

    try {
      return await this.loanRepository.save(loan);
    } catch (error) {
      if (
        isUniqueViolation(error) ||
        this.isActiveLoanConstraintViolation(error)
      ) {
        throw new ConflictException('Copy is already on loan');
      }
      throw error;
    }
  }

  getMyLoans(userId: number): Promise<Loan[]> {
    return this.loanRepository.find({
      where: { user_id: userId },
      order: { borrowed_at: 'DESC' },
    });
  }

  async returnLoan(loanId: number, returnedByUserId: number): Promise<Loan> {
    const loan = await this.findOne(loanId);
    if (loan.returned_at !== null) {
      throw new ConflictException('Loan already returned');
    }
    loan.returned_at = new Date();
    loan.returned_by_user_id = returnedByUserId;
    return this.loanRepository.save(loan);
  }

  findAll(query: FindLoansQueryDto): Promise<Loan[]> {
    const today = this.today();
    switch (query.status) {
      case LoanStatus.Active:
        return this.loanRepository.find({
          where: { returned_at: IsNull(), due_date: MoreThanOrEqual(today) },
        });
      case LoanStatus.Returned:
        return this.loanRepository.find({
          where: { returned_at: Not(IsNull()) },
        });
      case LoanStatus.Overdue:
        return this.loanRepository.find({
          where: { returned_at: IsNull(), due_date: LessThan(today) },
        });
      default:
        return this.loanRepository.find();
    }
  }

  async extendLoan(loanId: number, dueDays: number): Promise<Loan> {
    if (dueDays <= 0) {
      throw new BadRequestException('dueDays must be a positive integer');
    }

    const loan = await this.findOne(loanId);
    if (loan.returned_at !== null) {
      throw new ConflictException('Cannot extend a returned loan');
    }
    loan.due_date = this.addDays(loan.due_date, dueDays);
    return this.loanRepository.save(loan);
  }

  private today(): string {
    return new Date().toISOString().split('T')[0];
  }

  private addDays(dateStr: string, days: number): string {
    const d = new Date(dateStr + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().split('T')[0];
  }

  private isActiveLoanConstraintViolation(error: unknown): boolean {
    if (!(error instanceof Error)) {
      return false;
    }

    return (
      error.message.includes('IDX_loan_active_copy_unique') ||
      error.message.includes('UNIQUE constraint failed: loan.copy_id')
    );
  }
}
