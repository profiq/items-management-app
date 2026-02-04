import { ApiProperty } from '@nestjs/swagger';
export class CreateUserRequest {
  @ApiProperty()
  name: string;
  @ApiProperty()
  workspace_id: string;
}
