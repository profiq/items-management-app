import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { ItemCopy } from './entities/item-copy.entity';
import { CreateItemCopyDto } from './dto/create-item-copy.dto';
import { UpdateItemCopyDto } from './dto/update-item-copy.dto';
import { Item } from '@/items/entities/item.entity';
import { Location } from '@/locations/entities/location.entity';

@Injectable()
export class ItemCopiesService {
  constructor(
    @InjectRepository(ItemCopy)
    private readonly itemCopyRepository: Repository<ItemCopy>,
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>
  ) {}

  async create(createItemCopyDto: CreateItemCopyDto): Promise<ItemCopy> {
    const item = await this.itemRepository.findOneBy({
      id: createItemCopyDto.item_id,
    });
    if (!item) {
      throw new NotFoundException(
        `Item #${createItemCopyDto.item_id} not found`
      );
    }

    const location = await this.locationRepository.findOneBy({
      id: createItemCopyDto.location_id,
    });
    if (!location) {
      throw new NotFoundException(
        `Location #${createItemCopyDto.location_id} not found`
      );
    }

    const itemCopy: ItemCopy = this.itemCopyRepository.create({
      ...createItemCopyDto,
      condition: createItemCopyDto.condition ?? null,
      archived_at: null,
    });
    return this.itemCopyRepository.save(itemCopy);
  }

  findAll(): Promise<ItemCopy[]> {
    return this.itemCopyRepository.find();
  }

  findByItemId(itemId: number): Promise<ItemCopy[]> {
    return this.itemCopyRepository.find({
      where: { item_id: itemId, archived_at: IsNull() },
      relations: ['location'],
    });
  }

  async findOne(id: number): Promise<ItemCopy> {
    const itemCopy: ItemCopy | null = await this.itemCopyRepository.findOneBy({
      id,
    });
    if (!itemCopy) {
      throw new NotFoundException(`ItemCopy #${id} not found`);
    }
    return itemCopy;
  }

  async update(
    id: number,
    updateItemCopyDto: UpdateItemCopyDto
  ): Promise<ItemCopy> {
    const itemCopy: ItemCopy = await this.findOne(id);
    Object.assign(itemCopy, updateItemCopyDto);
    return this.itemCopyRepository.save(itemCopy);
  }

  async archive(id: number): Promise<ItemCopy> {
    const itemCopy: ItemCopy = await this.findOne(id);
    itemCopy.archived_at = new Date();
    return this.itemCopyRepository.save(itemCopy);
  }
}
