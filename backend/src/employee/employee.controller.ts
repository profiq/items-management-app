import { Controller, Get, Header, UseGuards } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { Employee } from './interfaces/employee.interface';
import { ApiOkResponse } from '@nestjs/swagger';
import { EmployeeResponse } from './dto/employee.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('employees')
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
  getEmployees(): Promise<Employee[]> {
    return this.employeeService.getEmployees();
  }
}
