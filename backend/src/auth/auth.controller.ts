import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from './auth.guard';
import { UserService } from '@/user/user.service';
import { User } from '@/user/user.entity';
import type { DecodedIdToken } from 'firebase-admin/auth';

type FirebaseRequest = {
  firebaseUser: DecodedIdToken;
};

@ApiTags('auth')
@Controller('auth')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class AuthController {
  constructor(private readonly userService: UserService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: User })
  async login(@Req() req: FirebaseRequest): Promise<User> {
    const user = await this.userService.upsertByGoogleWorkspaceToken(
      req.firebaseUser
    );
    if (user === null) {
      throw new NotFoundException('User not found in employee directory');
    }
    return user;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse()
  logout(): void {
    // Firebase tokens are stateless - invalidation happens on the client
  }

  @Get('me')
  @ApiOkResponse({ type: User })
  async getMe(@Req() req: FirebaseRequest): Promise<User> {
    const user = await this.userService.getUserByGoogleWorkspaceUid(
      req.firebaseUser
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
