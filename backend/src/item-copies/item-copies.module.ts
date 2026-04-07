import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemCopiesService } from './item-copies.service';
import { ItemCopiesController } from './item-copies.controller';
import { ItemCopy } from './entities/item-copy.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ItemCopy])],
  controllers: [ItemCopiesController],
  providers: [ItemCopiesService],
  exports: [ItemCopiesService],
})
export class ItemCopiesModule {}
