import { AuthService } from '@/auth/auth.service';
import { initializeApp } from 'firebase/app';
import {
  connectAuthEmulator,
  getAuth,
  signInWithEmailAndPassword,
  type Auth,
} from 'firebase/auth';
import { faker } from '@faker-js/faker';
import { FirebaseService } from '@/firebase/firebase.service';
import { ConfigService } from '@nestjs/config';
import type { DecodedIdToken } from 'firebase-admin/auth';

type setupAuthType = {
  authService: AuthService;
  validToken: string;
  invalidToken: string;
};

export async function setupAuth(): Promise<setupAuthType> {
  const configService = new ConfigService();
  const firebaseService = new FirebaseService(configService);
  const authService = new AuthService(firebaseService);
  const valid_email = faker.internet.email({ provider: 'profiq.com' });
  const invalid_email = faker.internet.email({});
  const password = faker.internet.password();
  if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    const auth = authService.getAuthApp();
    await auth.createUser({
      disabled: false,
      email: valid_email,
      emailVerified: true,
      password,
    });
    await auth.createUser({
      disabled: false,
      email: invalid_email,
      emailVerified: true,
      password,
    });
  }
  const firebaseApp = initializeApp({
    projectId: 'pq-reference-app-dev',
    apiKey: 'example-key',
    authDomain: 'example-auth',
  });
  const firebaseAuth: Auth = getAuth(firebaseApp);
  if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    connectAuthEmulator(
      firebaseAuth,
      `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}`
    );
  }
  const validToken = await getToken(firebaseAuth, valid_email, password);
  const invalidToken = await getToken(firebaseAuth, invalid_email, password);
  return { authService, validToken, invalidToken };
}

export function buildDecodedToken(
  googleWorkspaceUid: string,
  email: string,
  uid: string
): DecodedIdToken {
  const issuedAt = Math.floor(Date.now() / 1000);

  return {
    aud: 'test-audience',
    auth_time: issuedAt,
    email,
    email_verified: true,
    exp: issuedAt + 3600,
    firebase: {
      identities: { 'google.com': [googleWorkspaceUid] },
      sign_in_provider: 'google.com',
    },
    iat: issuedAt,
    iss: 'https://securetoken.google.com/pq-reference-app-dev',
    sub: uid,
    uid,
  };
}

async function getToken(auth: Auth, email: string, password: string) {
  return await (
    await signInWithEmailAndPassword(auth, email, password)
  ).user.getIdToken();
}
