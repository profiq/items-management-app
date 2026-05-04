import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@/auth/auth.guard';
import { RolesGuard } from '@/auth/roles.guard';
import { Roles } from '@/auth/roles.decorator';
import { UserRole } from '@/user/user.entity';
import { LoansService } from './loans.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { Loan } from './entities/loan.entity';

@ApiTags('loans')
@Controller('loans')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.Admin)
  create(@Body() createLoanDto: CreateLoanDto): Promise<Loan> {
    return this.loansService.create(createLoanDto);
  }

  @Get()
  findAll(): Promise<Loan[]> {
    return this.loansService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Loan> {
    return this.loansService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.Admin)
  update(
    @Param('id') id: string,
    @Body() updateLoanDto: UpdateLoanDto
  ): Promise<Loan> {
    return this.loansService.update(+id, updateLoanDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.Admin)
  remove(@Param('id') id: string): Promise<void> {
    return this.loansService.remove(+id);
  }
}
