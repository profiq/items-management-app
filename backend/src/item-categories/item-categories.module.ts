import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemCategoriesService } from './item-categories.service';
import { ItemCategoriesController } from './item-categories.controller';
import { ItemCategory } from './entities/item-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ItemCategory])],
  controllers: [ItemCategoriesController],
  providers: [ItemCategoriesService],
  exports: [ItemCategoriesService],
})
export class ItemCategoriesModule {}
