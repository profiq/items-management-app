import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Category } from '@/categories/entities/category.entity';
import { Tag } from '@/tags/entities/tag.entity';
import { ItemCopy } from '@/item-copies/entities/item-copy.entity';

@Entity()
export class Item {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column()
  @ApiProperty()
  name: string;

  @Column({ type: 'text', nullable: true, default: null })
  @ApiPropertyOptional({ nullable: true })
  description: string | null;

  @Column({ type: 'varchar', nullable: true, default: null })
  @ApiPropertyOptional({ nullable: true })
  image_url: string | null;

  @Column()
  @ApiProperty()
  default_loan_days: number;

  @Column({ type: 'datetime', nullable: true, default: null })
  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  archived_at: Date | null;

  @ManyToMany(() => Category, { eager: false })
  @JoinTable({
    name: 'item_category',
    joinColumn: { name: 'item_id' },
    inverseJoinColumn: { name: 'category_id' },
  })
  categories: Category[];

  @ManyToMany(() => Tag, { eager: false })
  @JoinTable({
    name: 'item_tag',
    joinColumn: { name: 'item_id' },
    inverseJoinColumn: { name: 'tag_id' },
  })
  tags: Tag[];

  @OneToMany(() => ItemCopy, copy => copy.item, { eager: false })
  @ApiPropertyOptional({ type: () => ItemCopy, isArray: true })
  copies?: ItemCopy[];
}
