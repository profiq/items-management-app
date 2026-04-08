import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ItemCategoriesService } from './item-categories.service';
import { CreateItemCategoryDto } from './dto/create-item-category.dto';
import { ItemCategory } from './entities/item-category.entity';

@ApiTags('item-categories')
@Controller('item-categories')
export class ItemCategoriesController {
  constructor(private readonly itemCategoriesService: ItemCategoriesService) {}

  @Post()
  create(@Body() createDto: CreateItemCategoryDto): Promise<ItemCategory> {
    return this.itemCategoriesService.create(createDto);
  }

  @Get()
  findAll(): Promise<ItemCategory[]> {
    return this.itemCategoriesService.findAll();
  }

  @Get('item/:itemId')
  findByItem(@Param('itemId') itemId: string): Promise<ItemCategory[]> {
    return this.itemCategoriesService.findByItem(+itemId);
  }

  @Delete('item/:itemId/category/:categoryId')
  remove(
    @Param('itemId') itemId: string,
    @Param('categoryId') categoryId: string
  ): Promise<void> {
    return this.itemCategoriesService.remove(+itemId, +categoryId);
  }
}
