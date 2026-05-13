import { FirebaseService } from '@/firebase/firebase.service';
import { Injectable } from '@nestjs/common';
import { Auth } from 'firebase-admin/auth';

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
      return await this.getAuthApp().verifyIdToken(idToken, true);
    } catch {
      return { email: undefined };
    }
  }

  async revokeRefreshTokens(uid: string): Promise<void> {
    await this.getAuthApp().revokeRefreshTokens(uid);
  }
}
