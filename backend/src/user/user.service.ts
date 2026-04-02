import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserRequest } from './dto/create_user';
import { EmployeeService } from '@/employee/employee.service';

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

  async saveUser(user: User) {
    await this.userRepository.save(user);
  }

  async deleteUser(id: number): Promise<boolean> {
    const deleted = await this.userRepository.delete({ id });
    return (deleted.affected ?? 0) > 0;
  }
}
