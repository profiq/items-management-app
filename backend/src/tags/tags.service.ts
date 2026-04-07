import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './entities/tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>
  ) {}

  create(createTagDto: CreateTagDto): Promise<Tag> {
    const tag: Tag = this.tagRepository.create(createTagDto);
    return this.tagRepository.save(tag);
  }

  findAll(): Promise<Tag[]> {
    return this.tagRepository.find();
  }

  async findOne(id: number): Promise<Tag> {
    const tag: Tag | null = await this.tagRepository.findOneBy({ id });
    if (!tag) {
      throw new NotFoundException(`Tag #${id} not found`);
    }
    return tag;
  }

  async update(id: number, updateTagDto: UpdateTagDto): Promise<Tag> {
    const tag: Tag = await this.findOne(id);
    Object.assign(tag, updateTagDto);
    return this.tagRepository.save(tag);
  }

  async remove(id: number): Promise<void> {
    const tag: Tag = await this.findOne(id);
    await this.tagRepository.remove(tag);
  }
}
