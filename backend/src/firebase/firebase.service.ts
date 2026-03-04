import { UploadException } from '@/lib/errors';
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
    return getStorage().bucket();
  }

  async upload(name: string, contents: SaveData): Promise<string> {
    const fileRef = this.getBucket().file(name);
    try {
      await fileRef.save(contents);
      return await getDownloadURL(fileRef);
    } catch {
      throw new UploadException();
    }
  }

  async delete(name: string) {
    const fileRef = this.getBucket().file(name);
    fileRef.delete();
  }
}
