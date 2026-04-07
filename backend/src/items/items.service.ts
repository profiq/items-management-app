import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './entities/item.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>
  ) {}

  create(createItemDto: CreateItemDto): Promise<Item> {
    const item: Item = this.itemRepository.create({
      ...createItemDto,
      description: createItemDto.description ?? null,
      image_url: createItemDto.image_url ?? null,
      archived_at: null,
    });
    return this.itemRepository.save(item);
  }

  findAll(): Promise<Item[]> {
    return this.itemRepository.find();
  }

  async findOne(id: number): Promise<Item> {
    const item: Item | null = await this.itemRepository.findOneBy({ id });
    if (!item) {
      throw new NotFoundException(`Item #${id} not found`);
    }
    return item;
  }

  async update(id: number, updateItemDto: UpdateItemDto): Promise<Item> {
    const item: Item = await this.findOne(id);
    Object.assign(item, updateItemDto);
    return this.itemRepository.save(item);
  }

  async remove(id: number): Promise<void> {
    const item: Item = await this.findOne(id);
    await this.itemRepository.remove(item);
  }
}
