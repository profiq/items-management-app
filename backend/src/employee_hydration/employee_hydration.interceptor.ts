import { EmployeeService } from '@/employee/employee.service';
import { UserService } from '@/user/user.service';
import {
  CallHandler,
  ExecutionContext,
  forwardRef,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { User } from '@/user/user.entity';
import { UpdatePetRequest } from '@/office_pet/dto/update_pet';
import { AddPetRequest } from '@/office_pet/dto/add_pet';

@Injectable()
export class EmployeeHydrationInterceptor implements NestInterceptor {
  constructor(
    @Inject(forwardRef(() => EmployeeService))
    private employeeService: EmployeeService,
    @Inject(forwardRef(() => UserService))
    private userService: UserService
  ) {}
  async intercept(context: ExecutionContext, next: CallHandler) {
    const { owner_id }: UpdatePetRequest | AddPetRequest = context
      .switchToHttp()
      .getRequest().body;
    if (await this.userService.getUserByEmployeeId(owner_id)) {
      return next.handle();
    }
    const employee = await this.employeeService.getEmployee(owner_id);
    if (!employee) {
      return next.handle();
    }
    const user = new User();
    user.name = employee.name;
    user.employee_id = owner_id;
    await this.userService.saveUser(user);
    return next.handle();
  }
}
