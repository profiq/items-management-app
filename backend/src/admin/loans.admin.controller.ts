import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@/auth/auth.guard';
import { RolesGuard } from '@/auth/roles.guard';
import { Roles } from '@/auth/roles.decorator';
import { UserRole } from '@/user/user.entity';
import { UserService } from '@/user/user.service';
import { UnknownUserException } from '@/lib/errors';
import { LoansService } from '@/loans/loans.service';
import { ExtendLoanDto } from '@/loans/dto/extend-loan.dto';
import { FindLoansQueryDto } from '@/loans/dto/find-loans-query.dto';
import { Loan } from '@/loans/entities/loan.entity';

type FirebaseRequest = { firebaseUser: DecodedIdToken };

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.Admin)
@Controller('admin/loans')
export class LoansAdminController {
  constructor(
    private readonly loansService: LoansService,
    private readonly userService: UserService
  ) {}

  @Get()
  findAll(@Query() query: FindLoansQueryDto): Promise<Loan[]> {
    return this.loansService.findAll(query);
  }

  @Put(':id/return')
  async returnLoan(
    @Req() req: FirebaseRequest,
    @Param('id', ParseIntPipe) id: number
  ): Promise<Loan> {
    const admin = await this.userService.getUserByGoogleWorkspaceUid(
      req.firebaseUser
    );
    if (!admin) throw new UnknownUserException();
    return this.loansService.returnLoan(id, admin.id);
  }

  @Put(':id/extend')
  extendLoan(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: ExtendLoanDto
  ): Promise<Loan> {
    return this.loansService.extendLoan(id, body.dueDays);
  }
}
