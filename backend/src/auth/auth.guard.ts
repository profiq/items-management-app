import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const idToken = request.headers['authorization']?.split(' ')[1];
    const token = await this.authService.verifyToken(idToken);
    if (!token.email?.endsWith('@profiq.com')) {
      return false;
    }
    return true;
  }
}
