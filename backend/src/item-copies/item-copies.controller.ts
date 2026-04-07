import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ItemCopiesService } from './item-copies.service';
import { CreateItemCopyDto } from './dto/create-item-copy.dto';
import { UpdateItemCopyDto } from './dto/update-item-copy.dto';
import { ItemCopy } from './entities/item-copy.entity';

@ApiTags('item-copies')
@Controller('item-copies')
export class ItemCopiesController {
  constructor(private readonly itemCopiesService: ItemCopiesService) {}

  @Post()
  create(@Body() createItemCopyDto: CreateItemCopyDto): Promise<ItemCopy> {
    return this.itemCopiesService.create(createItemCopyDto);
  }

  @Get()
  findAll(): Promise<ItemCopy[]> {
    return this.itemCopiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ItemCopy> {
    return this.itemCopiesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateItemCopyDto: UpdateItemCopyDto
  ): Promise<ItemCopy> {
    return this.itemCopiesService.update(+id, updateItemCopyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.itemCopiesService.remove(+id);
  }
}
