import { ApiProperty } from '@nestjs/swagger';
import { IEmployee } from '../interfaces/employee.interface';
export class EmployeeResponse implements IEmployee {
  @ApiProperty()
  id: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  photoUrl: string;
}
