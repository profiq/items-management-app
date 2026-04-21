import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemCopy } from './entities/item-copy.entity';
import { CreateItemCopyDto } from './dto/create-item-copy.dto';
import { UpdateItemCopyDto } from './dto/update-item-copy.dto';

@Injectable()
export class ItemCopiesService {
  constructor(
    @InjectRepository(ItemCopy)
    private readonly itemCopyRepository: Repository<ItemCopy>
  ) {}

  create(createItemCopyDto: CreateItemCopyDto): Promise<ItemCopy> {
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
      where: { item_id: itemId },
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
