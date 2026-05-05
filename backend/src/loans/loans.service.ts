import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Loan } from './entities/loan.entity';
import { ItemCopy } from '@/item-copies/entities/item-copy.entity';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';

@Injectable()
export class LoansService {
  constructor(
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
    @InjectRepository(ItemCopy)
    private readonly itemCopyRepository: Repository<ItemCopy>
  ) {}

  async create(createLoanDto: CreateLoanDto): Promise<Loan> {
    const copy = await this.itemCopyRepository.findOneBy({
      id: createLoanDto.copy_id,
      archived_at: IsNull(),
    });
    if (!copy) {
      throw new NotFoundException(
        `ItemCopy #${createLoanDto.copy_id} not found`
      );
    }

    const activeLoan = await this.loanRepository.findOneBy({
      copy_id: createLoanDto.copy_id,
      returned_at: IsNull(),
    });
    if (activeLoan) {
      throw new ConflictException(
        `ItemCopy #${createLoanDto.copy_id} is already on loan`
      );
    }

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

  async findOne(id: number): Promise<Loan> {
    const loan: Loan | null = await this.loanRepository.findOneBy({ id });
    if (!loan) {
      throw new NotFoundException(`Loan #${id} not found`);
    }
    return loan;
  }

  async update(id: number, updateLoanDto: UpdateLoanDto): Promise<Loan> {
    const loan: Loan = await this.findOne(id);
    Object.assign(loan, updateLoanDto);
    return this.loanRepository.save(loan);
  }

  async remove(id: number): Promise<void> {
    const loan: Loan = await this.findOne(id);
    await this.loanRepository.remove(loan);
  }
}
