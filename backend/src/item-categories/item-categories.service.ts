import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemCategory } from './entities/item-category.entity';
import { CreateItemCategoryDto } from './dto/create-item-category.dto';

@Injectable()
export class ItemCategoriesService {
  constructor(
    @InjectRepository(ItemCategory)
    private readonly itemCategoryRepository: Repository<ItemCategory>
  ) {}

  async create(createDto: CreateItemCategoryDto): Promise<ItemCategory> {
    const existing = await this.itemCategoryRepository.findOneBy({
      item_id: createDto.item_id,
      category_id: createDto.category_id,
    });
    if (existing) {
      throw new ConflictException(
        `Item #${createDto.item_id} already has category #${createDto.category_id}`
      );
    }
    const itemCategory: ItemCategory =
      this.itemCategoryRepository.create(createDto);
    return this.itemCategoryRepository.save(itemCategory);
  }

  findAll(): Promise<ItemCategory[]> {
    return this.itemCategoryRepository.find();
  }

  findByItem(itemId: number): Promise<ItemCategory[]> {
    return this.itemCategoryRepository.findBy({ item_id: itemId });
  }

  async remove(itemId: number, categoryId: number): Promise<void> {
    const itemCategory = await this.itemCategoryRepository.findOneBy({
      item_id: itemId,
      category_id: categoryId,
    });
    if (!itemCategory) {
      throw new NotFoundException(
        `Item #${itemId} does not have category #${categoryId}`
      );
    }
    await this.itemCategoryRepository.remove(itemCategory);
  }
}
