import { Controller, Get, Header, Post, UseGuards } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { IEmployee } from './interfaces/employee.interface';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { EmployeeResponse } from './dto/employee.dto';
import { AuthGuard } from '@/auth/auth.guard';
import { RolesGuard } from '@/auth/roles.guard';
import { Roles } from '@/auth/roles.decorator';
import { UserRole } from '@/user/user.entity';

@Controller('employees')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class EmployeeController {
  constructor(private employeeService: EmployeeService) {}

  @Get()
  @Header('Cache-Control', 'max-age=10, private')
  @ApiOkResponse({
    type: [EmployeeResponse],
    example: [
      {
        id: '1234',
        name: 'Pavel Novak',
        email: 'pavel.novak@example.com',
        photoUrl: 'https://cdn.example.com/novak_pic.png',
      },
    ],
  })
  getEmployees(): Promise<IEmployee[]> {
    return this.employeeService.getEmployees();
  }

  @Post('sync')
  @UseGuards(RolesGuard)
  @Roles(UserRole.Admin)
  syncEmployees() {
    return this.employeeService.syncEmployeeNames();
  }
}
