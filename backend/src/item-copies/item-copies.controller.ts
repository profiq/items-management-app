import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ItemCopiesService } from './item-copies.service';
import { ItemCopy } from './entities/item-copy.entity';

@ApiTags('item-copies')
@Controller('item-copies')
export class ItemCopiesController {
  constructor(private readonly itemCopiesService: ItemCopiesService) {}

  @Get()
  findAll(): Promise<ItemCopy[]> {
    return this.itemCopiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ItemCopy> {
    return this.itemCopiesService.findOne(+id);
  }
}
