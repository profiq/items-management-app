import { Module } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
import { FirebaseModule } from '@/firebase/firebase.module';

@Module({
  imports: [ConfigModule, FirebaseModule],
  providers: [AuthService, AuthGuard],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}
