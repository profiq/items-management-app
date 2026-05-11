import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@/auth/auth.guard';
import { UserService } from '@/user/user.service';
import { UnknownUserException } from '@/lib/errors';
import { LoansService } from './loans.service';
import { BorrowLoanDto } from './dto/borrow-loan.dto';
import { Loan } from './entities/loan.entity';

type FirebaseRequest = { firebaseUser: DecodedIdToken };

@ApiTags('loans')
@Controller('loans')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class LoansController {
  constructor(
    private readonly loansService: LoansService,
    private readonly userService: UserService
  ) {}

  @Get('my')
  async getMyLoans(@Req() req: FirebaseRequest): Promise<Loan[]> {
    const user = await this.userService.getUserByGoogleWorkspaceUid(
      req.firebaseUser
    );
    if (!user) throw new UnknownUserException();
    return this.loansService.getMyLoans(user.id);
  }

  @Post()
  async borrow(
    @Req() req: FirebaseRequest,
    @Body() body: BorrowLoanDto
  ): Promise<Loan> {
    const user = await this.userService.getUserByGoogleWorkspaceUid(
      req.firebaseUser
    );
    if (!user) throw new UnknownUserException();
    return this.loansService.borrow(body.copyId, user.id);
  }

  @Put(':id/return')
  async returnLoan(
    @Req() req: FirebaseRequest,
    @Param('id', ParseIntPipe) id: number
  ): Promise<Loan> {
    const user = await this.userService.getUserByGoogleWorkspaceUid(
      req.firebaseUser
    );
    if (!user) throw new UnknownUserException();
    const loan = await this.loansService.findOne(id);
    if (loan.user_id !== user.id) {
      throw new ForbiddenException('Only the borrower can return this loan');
    }
    return this.loansService.returnLoan(id, user.id);
  }
}
