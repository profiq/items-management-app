import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class ExtendLoanDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  dueDays: number;
}
