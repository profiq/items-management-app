import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { credential } from 'firebase-admin';
import { Auth } from 'firebase-admin/auth';

@Injectable()
export class AuthService {
  private authApp: Auth;
  constructor(private configService: ConfigService) {
    this.authApp = admin
      .initializeApp({
        credential: credential.cert({
          projectId: this.configService.get<string>('google.project_id'),
          clientEmail: this.configService.get<string>('google.client_email'),
          privateKey: this.configService.get<string>('google.private_key'),
        }),
      })
      .auth();
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
    } catch {
      return { email: undefined };
    }
  }
}
