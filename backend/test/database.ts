import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '@/user/user.entity';
import { Category } from '@/categories/entities/category.entity';
import { City } from '@/cities/entities/city.entity';
import { Tag } from '@/tags/entities/tag.entity';
import { Item } from '@/items/entities/item.entity';
import { Location } from '@/locations/entities/location.entity';

export const dbConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: ':memory:',
  entities: [User, Category, City, Tag, Item, Location],
  synchronize: true,
  dropSchema: true,
};
