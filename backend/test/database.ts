import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '@/user/user.entity';
import { Category } from '@/categories/entities/category.entity';
import { City } from '@/cities/entities/city.entity';
import { Tag } from '@/tags/entities/tag.entity';

export const dbConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: ':memory:',
  entities: [User, Category, City, Tag],
  synchronize: true,
  dropSchema: true,
};
