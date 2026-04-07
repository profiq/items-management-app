import { ApiProperty } from '@nestjs/swagger';

export class CreateEmailNotificationDto {
  @ApiProperty()
  loan_id: number;

  @ApiProperty({ example: 'due_soon' })
  type: string;
}
