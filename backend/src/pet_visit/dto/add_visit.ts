import { ApiProperty } from '@nestjs/swagger';
import { IsDate } from 'class-validator';
export class AddVisitRequest {
  @ApiProperty()
  pet_id: number;

  @ApiProperty()
  @IsDate()
  date?: Date;
}
