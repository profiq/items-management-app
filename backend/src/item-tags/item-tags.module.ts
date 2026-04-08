import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemTagsService } from './item-tags.service';
import { ItemTagsController } from './item-tags.controller';
import { ItemTag } from './entities/item-tag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ItemTag])],
  controllers: [ItemTagsController],
  providers: [ItemTagsService],
  exports: [ItemTagsService],
})
export class ItemTagsModule {}
