import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { AuthGuard } from '@/auth/auth.guard';
import { RolesGuard } from '@/auth/roles.guard';
import { Roles } from '@/auth/roles.decorator';
import { User, UserRole } from '@/user/user.entity';
import { UserService } from '@/user/user.service';
import { UnknownUserException } from '@/lib/errors';
import { LoansService } from './loans.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { ReturnLoanDto } from './dto/return-loan.dto';
import { Loan } from './entities/loan.entity';

type FirebaseRequest = {
  firebaseUser: DecodedIdToken;
};

@ApiTags('loans')
@Controller('loans')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class LoansController {
  constructor(
    private readonly loansService: LoansService,
    private readonly userService: UserService
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.Admin)
  create(@Body() createLoanDto: CreateLoanDto): Promise<Loan> {
    return this.loansService.create(createLoanDto);
  }

  @Get()
  async findAll(@Req() req: FirebaseRequest): Promise<Loan[]> {
    const currentUser = await this.getCurrentUserOrThrow(req);
    if (currentUser.role === UserRole.Admin) {
      return this.loansService.findAll();
    }
    return this.loansService.findAllForUser(currentUser.id);
  }

  @Get(':id')
  async findOne(
    @Req() req: FirebaseRequest,
    @Param('id') id: string
  ): Promise<Loan> {
    const currentUser = await this.getCurrentUserOrThrow(req);
    if (currentUser.role === UserRole.Admin) {
      return this.loansService.findOne(+id);
    }
    return this.loansService.findOneForUser(+id, currentUser.id);
  }

  private async getCurrentUserOrThrow(req: FirebaseRequest): Promise<User> {
    const currentUser = await this.userService.getUserByGoogleWorkspaceUid(
      req.firebaseUser
    );
    if (!currentUser) {
      throw new UnknownUserException();
    }
    return currentUser;
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.Admin)
  update(
    @Param('id') id: string,
    @Body() returnLoanDto: ReturnLoanDto
  ): Promise<Loan> {
    return this.loansService.update(+id, returnLoanDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.Admin)
  remove(@Param('id') id: string): Promise<void> {
    return this.loansService.remove(+id);
  }
}
