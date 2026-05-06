import { FirebaseService } from '@/firebase/firebase.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Auth } from 'firebase-admin/auth';

const unauthorizedFirebaseTokenErrorCodes = new Set([
  'auth/id-token-expired',
  'auth/id-token-revoked',
]);

@Injectable()
export class AuthService {
  private authApp: Auth;
  constructor(private firebaseService: FirebaseService) {
    this.authApp = this.firebaseService.getApp().auth();
  }

  getAuthApp(): Auth {
    return this.authApp;
  }

  async verifyToken(idToken: string) {
    if (!idToken) {
      return { email: undefined };
    }
    try {
      return await this.getAuthApp().verifyIdToken(idToken);
    } catch (error) {
      if (isUnauthorizedFirebaseTokenError(error)) {
        throw new UnauthorizedException('Expired or revoked Firebase ID token');
      }
      return { email: undefined };
    }
  }
}

function isUnauthorizedFirebaseTokenError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string' &&
    unauthorizedFirebaseTokenErrorCodes.has(error.code)
  );
}
