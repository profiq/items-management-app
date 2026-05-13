import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateEmailNotificationDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  loan_id: number;

  @ApiProperty({ example: 'due_soon' })
  @IsString()
  @IsNotEmpty()
  type: string;
}
