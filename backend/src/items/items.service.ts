import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Item } from './entities/item.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { FindItemsQueryDto } from './dto/find-items-query.dto';
import { PaginatedItemsResponseDto } from './dto/paginated-items-response.dto';
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

  private async findCategoriesOrThrow(ids: number[]): Promise<Category[]> {
    const uniqueIds = [...new Set(ids)];
    const categories = await this.categoryRepository.findBy({
      id: In(uniqueIds),
    });
    const foundIds = categories.map(c => c.id);
    const missingIds = uniqueIds.filter(id => !foundIds.includes(id));
    if (missingIds.length) {
      throw new NotFoundException(
        `Categories not found: ${missingIds.join(', ')}`
      );
    }
    return categories;
  }

  private async findTagsOrThrow(ids: number[]): Promise<Tag[]> {
    const uniqueIds = [...new Set(ids)];
    const tags = await this.tagRepository.findBy({ id: In(uniqueIds) });
    const foundIds = tags.map(t => t.id);
    const missingIds = uniqueIds.filter(id => !foundIds.includes(id));
    if (missingIds.length) {
      throw new NotFoundException(`Tags not found: ${missingIds.join(', ')}`);
    }
    return tags;
  }

  async create(createItemDto: CreateItemDto): Promise<Item> {
    const { categoryIds, tagIds, ...itemData } = createItemDto;

    const item = this.itemRepository.create({
      ...itemData,
      description: itemData.description ?? null,
      image_url: itemData.image_url ?? null,
      archived_at: null,
    });

    item.categories = categoryIds?.length
      ? await this.findCategoriesOrThrow(categoryIds)
      : [];

    item.tags = tagIds?.length ? await this.findTagsOrThrow(tagIds) : [];

    return this.itemRepository.save(item);
  }

  async findAll(query: FindItemsQueryDto): Promise<PaginatedItemsResponseDto> {
    const { search, categoryId, available, page = 1, limit = 20 } = query;
    const availableCopyExistsClause = `EXISTS (
      SELECT 1 FROM item_copy copy
      WHERE copy.item_id = item.id
        AND copy.archived_at IS NULL
        AND NOT EXISTS (
          SELECT 1 FROM loan
          WHERE loan.copy_id = copy.id
            AND loan.returned_at IS NULL
        )
    )`;

    const qb = this.itemRepository
      .createQueryBuilder('item')
      .distinct(true)
      .leftJoinAndSelect('item.categories', 'category')
      .leftJoinAndSelect('item.tags', 'tag')
      .where('item.archived_at IS NULL');

    if (search) {
      qb.andWhere('(item.name LIKE :search OR item.description LIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (categoryId) {
      qb.innerJoin(
        'item.categories',
        'filterCategory',
        'filterCategory.id = :categoryId',
        { categoryId }
      );
    }

    if (available === true) {
      qb.andWhere(availableCopyExistsClause);
    }

    if (available === false) {
      qb.andWhere(`NOT ${availableCopyExistsClause}`);
    }

    const [data, total] = await qb
      .orderBy('item.id', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Item> {
    const item = await this.itemRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.categories', 'category')
      .leftJoinAndSelect('item.tags', 'tag')
      .leftJoinAndSelect('item.copies', 'copy', 'copy.archived_at IS NULL')
      .leftJoinAndSelect('copy.location', 'location')
      .where('item.id = :id', { id })
      .andWhere('item.archived_at IS NULL')
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
        ? await this.findCategoriesOrThrow(categoryIds)
        : [];
    }

    if (tagIds !== undefined) {
      item.tags = tagIds.length ? await this.findTagsOrThrow(tagIds) : [];
    }

    return this.itemRepository.save(item);
  }

  async remove(id: number): Promise<void> {
    const item = await this.findOne(id);
    await this.itemRepository.remove(item);
  }
}
