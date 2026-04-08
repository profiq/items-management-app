import { ApiProperty } from '@nestjs/swagger';
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Item } from '../../items/entities/item.entity';
import { Tag } from '../../tags/entities/tag.entity';

@Entity()
export class ItemTag {
  @PrimaryColumn()
  @ApiProperty()
  item_id: number;

  @PrimaryColumn()
  @ApiProperty()
  tag_id: number;

  @ManyToOne(() => Item, { nullable: false, eager: false })
  @JoinColumn({ name: 'item_id' })
  item: Item;

  @ManyToOne(() => Tag, { nullable: false, eager: false })
  @JoinColumn({ name: 'tag_id' })
  tag: Tag;
}
