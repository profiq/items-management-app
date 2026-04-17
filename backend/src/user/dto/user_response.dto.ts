import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../user.entity';

export class UserResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: UserRole, enumName: 'UserRole' })
  role: UserRole;
}
