import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

export enum LoanStatus {
  Active = 'active',
  Returned = 'returned',
  Overdue = 'overdue',
}

export class FindLoansQueryDto {
  @ApiPropertyOptional({ enum: LoanStatus })
  @IsOptional()
  @IsEnum(LoanStatus)
  status?: LoanStatus;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;
}
