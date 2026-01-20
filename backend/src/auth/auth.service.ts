import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { credential } from 'firebase-admin';
import { Auth } from 'firebase-admin/auth';

@Injectable()
export class AuthService {
  private authApp: Auth;
  constructor() {
    this.authApp = admin
      .initializeApp({
        credential: credential.cert({
          projectId:
            process.env.FIREBASE_PROJECT_ID ||
            process.env.VITE_FIREBASE_PROJECT_ID,
          clientEmail: process.env.GOOGLE_CLIENT_EMAIL,
          privateKey: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
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
