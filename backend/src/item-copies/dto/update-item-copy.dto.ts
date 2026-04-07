import { PartialType } from '@nestjs/swagger';
import { CreateItemCopyDto } from './create-item-copy.dto';

export class UpdateItemCopyDto extends PartialType(CreateItemCopyDto) {}
