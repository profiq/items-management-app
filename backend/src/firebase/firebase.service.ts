import { DeleteException, UploadException } from '@/lib/errors';
import { Bucket, SaveData } from '@google-cloud/storage';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { credential } from 'firebase-admin';
import { getDownloadURL, getStorage } from 'firebase-admin/storage';

@Injectable()
export class FirebaseService {
  private firebaseApp: admin.app.App;
  constructor(private configService: ConfigService) {
    if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
      this.firebaseApp = admin.initializeApp({
        projectId: 'pq-reference-app-dev',
        storageBucket: configService.get<string>('google.storage_bucket'),
      });
    } else {
      this.firebaseApp = admin.initializeApp({
        credential: credential.cert({
          projectId: this.configService.get<string>('google.project_id'),
          clientEmail: this.configService.get<string>('google.client_email'),
          privateKey: this.configService.get<string>('google.private_key'),
        }),
        storageBucket: this.configService.get<string>('google.storage_bucket'),
      });
    }
  }

  getApp(): admin.app.App {
    return this.firebaseApp;
  }

  getBucket(): Bucket {
    return getStorage(this.firebaseApp).bucket();
  }

  async upload(name: string, contents: SaveData): Promise<string> {
    const fileRef = this.getBucket().file(name);
    try {
      await fileRef.save(contents);
      return await getDownloadURL(fileRef);
    } catch (err: unknown) {
      throw new UploadException({ cause: err });
    }
  }

  async delete(name: string): Promise<void> {
    const fileRef = this.getBucket().file(name);
    try {
      await fileRef.delete();
    } catch (err: unknown) {
      if (this.isStorageNotFoundError(err)) {
        return;
      }
      throw new DeleteException({ cause: err });
    }
  }

  private isStorageNotFoundError(err: unknown): boolean {
    const { code } = err as { code?: unknown };
    return code === 404 || code === '404';
  }
}
