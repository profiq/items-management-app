import { ApiProperty } from '@nestjs/swagger';
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Item } from '../../items/entities/item.entity';
import { Category } from '../../categories/entities/category.entity';

@Entity()
export class ItemCategory {
  @PrimaryColumn()
  @ApiProperty()
  item_id: number;

  @PrimaryColumn()
  @ApiProperty()
  category_id: number;

  @ManyToOne(() => Item, { nullable: false, eager: false })
  @JoinColumn({ name: 'item_id' })
  item: Item;

  @ManyToOne(() => Category, { nullable: false, eager: false })
  @JoinColumn({ name: 'category_id' })
  category: Category;
}
