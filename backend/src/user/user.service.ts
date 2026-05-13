import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { User, UserRole } from './user.entity';
import { CreateUserRequest } from './dto/create_user';
import { EmployeeService } from '@/employee/employee.service';

export type UpsertResult =
  | { user: User }
  | { error: 'no-google-identity' | 'not-in-directory' };

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(forwardRef(() => EmployeeService))
    private employeeService: EmployeeService
  ) {}

  async getUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  async getUserById(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
    });
  }

  async getUserByEmployeeId(employee_id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { employee_id },
    });
  }

  async createUser(data: CreateUserRequest): Promise<User | null> {
    const employee = await this.employeeService.getEmployee(data.workspace_id);
    if (!employee) {
      return null;
    }
    // save method would overwrite if exists and insert is primitive (without cascades)
    const exists = await this.userRepository.findOneBy({
      employee_id: employee.id,
    });
    if (exists) {
      return null;
    }
    const new_user = new User();
    new_user.name = employee.name;
    new_user.employee_id = employee.id;
    await this.userRepository.save(new_user);
    return new_user;
  }

  private extractGoogleUid(token: {
    firebase?: { identities?: Record<string, unknown> };
  }): string | undefined {
    return (
      token.firebase?.identities?.['google.com'] as string[] | undefined
    )?.[0];
  }

  async getUserByGoogleWorkspaceUid(token: {
    uid: string;
    firebase?: { identities?: Record<string, unknown> };
  }): Promise<User | null> {
    const googleUid = this.extractGoogleUid(token);
    if (!googleUid) {
      return null;
    }
    return this.getUserByEmployeeId(googleUid);
  }

  async findByGoogleWorkspaceToken(token: {
    uid: string;
    firebase?: { identities?: Record<string, unknown> };
  }): Promise<UpsertResult> {
    const googleUid = this.extractGoogleUid(token);
    if (!googleUid) {
      return { error: 'no-google-identity' };
    }
    const user = await this.getUserByEmployeeId(googleUid);
    if (!user) {
      return { error: 'not-in-directory' };
    }
    return { user };
  }

  async upsertByGoogleWorkspaceToken(token: {
    uid: string;
    firebase?: { identities?: Record<string, unknown> };
  }): Promise<UpsertResult> {
    const googleUid = this.extractGoogleUid(token);
    if (!googleUid) {
      return { error: 'no-google-identity' };
    }
    const existing = await this.getUserByEmployeeId(googleUid);
    if (existing) {
      return { user: existing };
    }
    const employee = await this.employeeService.getEmployee(googleUid);
    if (!employee) {
      return { error: 'not-in-directory' };
    }
    const user = new User();
    user.employee_id = googleUid;
    user.name = employee.name;
    user.role =
      process.env.FIRST_ADMIN_EMAIL &&
      employee.email?.trim().toLowerCase() ===
        process.env.FIRST_ADMIN_EMAIL.trim().toLowerCase()
        ? UserRole.Admin
        : UserRole.User;
    try {
      await this.userRepository.save(user);
    } catch (e) {
      if (e instanceof QueryFailedError) {
        const concurrent = await this.getUserByEmployeeId(googleUid);
        if (concurrent) {
          return { user: concurrent };
        }
      }
      throw e;
    }
    return { user };
  }

  async updateUserRole(
    id: number,
    role: UserRole,
    currentUserId: number
  ): Promise<User | null> {
    if (id === currentUserId && role !== UserRole.Admin) {
      throw new ForbiddenException('Cannot demote yourself');
    }
    const user = await this.getUserById(id);
    if (!user) {
      return null;
    }
    if (user.role === UserRole.Admin && role !== UserRole.Admin) {
      const adminCount = await this.userRepository.count({
        where: { role: UserRole.Admin },
      });
      if (adminCount <= 1) {
        throw new ForbiddenException('Cannot remove the last admin');
      }
    }
    user.role = role;
    await this.userRepository.save(user);
    return user;
  }

  async saveUser(user: User) {
    await this.userRepository.save(user);
  }

  async saveUsers(users: User[]): Promise<void> {
    if (users.length === 0) {
      return;
    }
    await this.userRepository.manager.transaction(async manager => {
      await manager.save(User, users);
    });
  }

  async deleteUser(id: number): Promise<boolean> {
    const deleted = await this.userRepository.delete({ id });
    return (deleted.affected ?? 0) > 0;
  }
}
