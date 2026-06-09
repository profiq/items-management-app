import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/user/user.entity';
import { IdentityService } from './identity.service';
import { RolesGuard } from './roles.guard';

/**
 * Thin module owning the cross-cutting role check. Imported by every module
 * that uses {@link RolesGuard} via `@Roles()`, so the guard is registered
 * exactly once instead of being duplicated as a provider per module.
 */
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [IdentityService, RolesGuard],
  exports: [IdentityService, RolesGuard],
})
export class RolesModule {}
