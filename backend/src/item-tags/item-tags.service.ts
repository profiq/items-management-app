import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemTag } from './entities/item-tag.entity';
import { CreateItemTagDto } from './dto/create-item-tag.dto';

@Injectable()
export class ItemTagsService {
  constructor(
    @InjectRepository(ItemTag)
    private readonly itemTagRepository: Repository<ItemTag>
  ) {}

  async create(createDto: CreateItemTagDto): Promise<ItemTag> {
    const existing = await this.itemTagRepository.findOneBy({
      item_id: createDto.item_id,
      tag_id: createDto.tag_id,
    });
    if (existing) {
      throw new ConflictException(
        `Item #${createDto.item_id} already has tag #${createDto.tag_id}`
      );
    }
    const itemTag: ItemTag = this.itemTagRepository.create(createDto);
    return this.itemTagRepository.save(itemTag);
  }

  findAll(): Promise<ItemTag[]> {
    return this.itemTagRepository.find();
  }

  findByItem(itemId: number): Promise<ItemTag[]> {
    return this.itemTagRepository.findBy({ item_id: itemId });
  }

  async remove(itemId: number, tagId: number): Promise<void> {
    const itemTag = await this.itemTagRepository.findOneBy({
      item_id: itemId,
      tag_id: tagId,
    });
    if (!itemTag) {
      throw new NotFoundException(
        `Item #${itemId} does not have tag #${tagId}`
      );
    }
    await this.itemTagRepository.remove(itemTag);
  }
}
