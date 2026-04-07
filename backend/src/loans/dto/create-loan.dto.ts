import { ApiProperty } from '@nestjs/swagger';

export class CreateLoanDto {
  @ApiProperty()
  copy_id: number;

  @ApiProperty()
  user_id: number;

  @ApiProperty({ type: String, format: 'date', example: '2026-05-01' })
  due_date: string;
}
