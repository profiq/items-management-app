import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ItemTagsService } from './item-tags.service';
import { CreateItemTagDto } from './dto/create-item-tag.dto';
import { ItemTag } from './entities/item-tag.entity';

@ApiTags('item-tags')
@Controller('item-tags')
export class ItemTagsController {
  constructor(private readonly itemTagsService: ItemTagsService) {}

  @Post()
  create(@Body() createDto: CreateItemTagDto): Promise<ItemTag> {
    return this.itemTagsService.create(createDto);
  }

  @Get()
  findAll(): Promise<ItemTag[]> {
    return this.itemTagsService.findAll();
  }

  @Get('item/:itemId')
  findByItem(@Param('itemId') itemId: string): Promise<ItemTag[]> {
    return this.itemTagsService.findByItem(+itemId);
  }

  @Delete('item/:itemId/tag/:tagId')
  remove(
    @Param('itemId') itemId: string,
    @Param('tagId') tagId: string
  ): Promise<void> {
    return this.itemTagsService.remove(+itemId, +tagId);
  }
}
