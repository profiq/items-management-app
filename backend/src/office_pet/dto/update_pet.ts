import { ApiProperty } from '@nestjs/swagger';
export class UpdatePetRequest {
  @ApiProperty()
  owner_id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  species: string;

  @ApiProperty()
  race: string;
}
