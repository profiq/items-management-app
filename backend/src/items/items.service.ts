import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Item } from './entities/item.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { Category } from '@/categories/entities/category.entity';
import { Tag } from '@/tags/entities/tag.entity';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>
  ) {}

  async create(createItemDto: CreateItemDto): Promise<Item> {
    const { categoryIds, tagIds, ...itemData } = createItemDto;

    const item = this.itemRepository.create({
      ...itemData,
      description: itemData.description ?? null,
      image_url: itemData.image_url ?? null,
      archived_at: null,
    });

    item.categories = categoryIds?.length
      ? await this.categoryRepository.findBy({ id: In(categoryIds) })
      : [];

    item.tags = tagIds?.length
      ? await this.tagRepository.findBy({ id: In(tagIds) })
      : [];

    return this.itemRepository.save(item);
  }

  findAll(): Promise<Item[]> {
    return this.itemRepository.find({ relations: ['categories', 'tags'] });
  }

  async findOne(id: number): Promise<Item> {
    const item = await this.itemRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.categories', 'category')
      .leftJoinAndSelect('item.tags', 'tag')
      .leftJoinAndSelect('item.copies', 'copy', 'copy.archived_at IS NULL')
      .leftJoinAndSelect('copy.location', 'location')
      .where('item.id = :id', { id })
      .getOne();
    if (!item) {
      throw new NotFoundException(`Item #${id} not found`);
    }
    return item;
  }

  async update(id: number, updateItemDto: UpdateItemDto): Promise<Item> {
    const { categoryIds, tagIds, ...itemData } = updateItemDto;
    const item = await this.findOne(id);

    Object.assign(item, itemData);

    if (categoryIds !== undefined) {
      item.categories = categoryIds.length
        ? await this.categoryRepository.findBy({ id: In(categoryIds) })
        : [];
    }

    if (tagIds !== undefined) {
      item.tags = tagIds.length
        ? await this.tagRepository.findBy({ id: In(tagIds) })
        : [];
    }

    return this.itemRepository.save(item);
  }

  async remove(id: number): Promise<void> {
    const item = await this.findOne(id);
    await this.itemRepository.remove(item);
  }
}
