import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserService } from '@/user/user.service';
import { ROLES_KEY } from './roles.decorator';
import { UserRole } from '@/user/user.entity';
import type { DecodedIdToken } from 'firebase-admin/auth';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userService: UserService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    const request = context.switchToHttp().getRequest<{
      firebaseUser?: DecodedIdToken;
    }>();
    const firebaseUser = request.firebaseUser;
    if (!firebaseUser) {
      return false;
    }
    const user =
      await this.userService.getUserByGoogleWorkspaceUid(firebaseUser);
    if (!user) {
      return false;
    }
    return requiredRoles.includes(user.role);
  }
}
