import { ApiProperty } from '@nestjs/swagger';
import { Employee } from '../interfaces/employee.interface';
export class EmployeeResponse implements Employee {
  @ApiProperty()
  id: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  photoUrl: string;
}
