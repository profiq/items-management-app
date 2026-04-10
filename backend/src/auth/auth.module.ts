import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule } from '@nestjs/config';
import { FirebaseModule } from '@/firebase/firebase.module';
import { UserModule } from '@/user/user.module';

@Module({
  imports: [ConfigModule, FirebaseModule, forwardRef(() => UserModule)],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
