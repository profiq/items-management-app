import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Loan } from './entities/loan.entity';
import { CreateLoanDto } from './dto/create-loan.dto';
import { ReturnLoanDto } from './dto/return-loan.dto';

@Injectable()
export class LoansService {
  constructor(
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>
  ) {}

  create(createLoanDto: CreateLoanDto): Promise<Loan> {
    const loan: Loan = this.loanRepository.create({
      ...createLoanDto,
      borrowed_at: new Date(),
      returned_at: null,
      returned_by_user_id: null,
    });
    return this.loanRepository.save(loan);
  }

  findAll(): Promise<Loan[]> {
    return this.loanRepository.find();
  }

  findAllForUser(userId: number): Promise<Loan[]> {
    return this.loanRepository.findBy({ user_id: userId });
  }

  async findOne(id: number): Promise<Loan> {
    const loan: Loan | null = await this.loanRepository.findOneBy({ id });
    if (!loan) {
      throw new NotFoundException(`Loan #${id} not found`);
    }
    return loan;
  }

  async findOneForUser(id: number, userId: number): Promise<Loan> {
    const loan: Loan | null = await this.loanRepository.findOneBy({
      id,
      user_id: userId,
    });
    if (!loan) {
      throw new NotFoundException(`Loan #${id} not found`);
    }
    return loan;
  }

  async update(id: number, returnLoanDto: ReturnLoanDto): Promise<Loan> {
    const loan: Loan = await this.findOne(id);
    const { returned_at, ...loanData } = returnLoanDto;

    Object.assign(loan, loanData);
    if (returned_at !== undefined) {
      loan.returned_at = returned_at === null ? null : new Date(returned_at);
    }

    return this.loanRepository.save(loan);
  }

  async remove(id: number): Promise<void> {
    const loan: Loan = await this.findOne(id);
    await this.loanRepository.remove(loan);
  }
}
