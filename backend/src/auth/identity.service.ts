import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '@/user/user.entity';

/**
 * Lightweight, repository-backed identity lookups for the {@link RolesGuard}.
 *
 * Lives in its own module (RolesModule) so guarded modules can depend on role
 * checks without pulling in the full UserModule, which would reintroduce the
 * Auth <-> User circular dependency.
 */
@Injectable()
export class IdentityService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async getRoleByFirebaseUser(token: {
    firebase?: { identities?: Record<string, unknown> };
  }): Promise<UserRole | null> {
    const googleUid = (
      token.firebase?.identities?.['google.com'] as string[] | undefined
    )?.[0];
    if (!googleUid) {
      return null;
    }
    const user = await this.userRepository.findOne({
      where: { employee_id: googleUid },
    });
    return user?.role ?? null;
  }
}
