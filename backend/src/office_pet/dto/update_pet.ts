import { ApiProperty } from '@nestjs/swagger';
export class UpdatePetRequest {
  @ApiProperty()
  owner_id: number;

  @ApiProperty()
  name: string;
}
