import { ApiProperty } from '@nestjs/swagger';

export class CreateLocationDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  city_id: number;
}
