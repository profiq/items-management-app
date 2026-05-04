import {
  BadRequestException,
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
import { UserResponseDto } from '@/user/dto/user_response.dto';
import type { DecodedIdToken } from 'firebase-admin/auth';

type FirebaseRequest = {
  firebaseUser: DecodedIdToken;
};

function toUserResponseDto(user: {
  id: number;
  name: string;
  role: import('@/user/user.entity').UserRole;
}): UserResponseDto {
  const dto = new UserResponseDto();
  dto.id = user.id;
  dto.name = user.name;
  dto.role = user.role;
  return dto;
}

@ApiTags('auth')
@Controller('auth')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class AuthController {
  constructor(private readonly userService: UserService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: UserResponseDto })
  async login(@Req() req: FirebaseRequest): Promise<UserResponseDto> {
    const result = await this.userService.upsertByGoogleWorkspaceToken(
      req.firebaseUser
    );
    if ('error' in result) {
      if (result.error === 'no-google-identity') {
        throw new BadRequestException(
          'Token does not contain a Google identity'
        );
      }
      throw new NotFoundException('User not found in employee directory');
    }
    return toUserResponseDto(result.user);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse()
  logout(): void {
    // Firebase tokens are stateless - invalidation happens on the client
  }

  @Get('me')
  @ApiOkResponse({ type: UserResponseDto })
  async getMe(@Req() req: FirebaseRequest): Promise<UserResponseDto> {
    const result = await this.userService.findByGoogleWorkspaceToken(
      req.firebaseUser
    );
    if ('error' in result) {
      if (result.error === 'no-google-identity') {
        throw new BadRequestException(
          'Token does not contain a Google identity'
        );
      }
      throw new NotFoundException('User not found in employee directory');
    }
    return toUserResponseDto(result.user);
  }
}
