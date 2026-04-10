import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';
import { CreateUserRequest } from './dto/create_user';
import { EmployeeService } from '@/employee/employee.service';
import type { DecodedIdToken } from 'firebase-admin/auth';

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

  async getUserByFirebaseUid(firebase_uid: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { firebase_uid } });
  }

  async upsertByFirebaseToken(token: DecodedIdToken): Promise<User | null> {
    let user = await this.getUserByFirebaseUid(token.uid);
    if (user) {
      user.email = token.email ?? user.email;
      await this.userRepository.save(user);
      return user;
    }
    // Try to find by employee_id (google workspace uid)
    const googleUid =
      (
        token.firebase?.identities?.['google.com'] as string[] | undefined
      )?.[0] ?? '';
    if (googleUid) {
      user = await this.getUserByEmployeeId(googleUid);
    }
    if (user) {
      user.firebase_uid = token.uid;
      user.email = token.email ?? user.email;
      await this.userRepository.save(user);
      return user;
    }
    // Auto-create user from token if employee lookup is not possible
    const newUser = new User();
    newUser.firebase_uid = token.uid;
    newUser.email = token.email ?? '';
    newUser.name = token.name ?? token.email ?? '';
    newUser.employee_id = googleUid || token.uid;
    newUser.role = UserRole.User;
    await this.userRepository.save(newUser);
    return newUser;
  }

  async updateUserRole(id: number, role: UserRole): Promise<User | null> {
    const user = await this.getUserById(id);
    if (!user) {
      return null;
    }
    user.role = role;
    await this.userRepository.save(user);
    return user;
  }

  async saveUser(user: User) {
    await this.userRepository.save(user);
  }

  async deleteUser(id: number): Promise<boolean> {
    const deleted = await this.userRepository.delete({ id });
    return (deleted.affected ?? 0) > 0;
  }
}
