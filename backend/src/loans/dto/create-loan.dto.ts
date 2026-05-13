import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, Min } from 'class-validator';

export class CreateLoanDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  copy_id: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  user_id: number;

  @ApiProperty({ type: String, format: 'date', example: '2026-05-01' })
  @IsDateString()
  due_date: string;
}
