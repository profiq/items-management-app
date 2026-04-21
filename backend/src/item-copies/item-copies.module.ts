import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemCopiesService } from './item-copies.service';
import { ItemCopiesController } from './item-copies.controller';
import { ItemCopy } from './entities/item-copy.entity';
import { Item } from '@/items/entities/item.entity';
import { Location } from '@/locations/entities/location.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ItemCopy, Item, Location])],
  controllers: [ItemCopiesController],
  providers: [ItemCopiesService],
  exports: [ItemCopiesService],
})
export class ItemCopiesModule {}
