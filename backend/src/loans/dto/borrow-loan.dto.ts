import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class BorrowLoanDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  copyId: number;
}
