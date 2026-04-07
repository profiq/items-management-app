import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLoanDto {
  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  returned_at?: Date | null;

  @ApiPropertyOptional({ nullable: true })
  returned_by_user_id?: number | null;
}
