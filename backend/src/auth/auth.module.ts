import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
import { FirebaseModule } from '@/firebase/firebase.module';

@Module({
  imports: [ConfigModule, FirebaseModule],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
