import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '@/user/user.entity';
import { Category } from '@/categories/entities/category.entity';
import { City } from '@/cities/entities/city.entity';
import { Tag } from '@/tags/entities/tag.entity';
import { Item } from '@/items/entities/item.entity';
import { Location } from '@/locations/entities/location.entity';
import { ItemCopy } from '@/item-copies/entities/item-copy.entity';
import { Loan } from '@/loans/entities/loan.entity';
import { EmailNotification } from '@/email-notifications/entities/email-notification.entity';
import { ItemCategory } from '@/item-categories/entities/item-category.entity';
import { ItemTag } from '@/item-tags/entities/item-tag.entity';

export const dbConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: ':memory:',
  entities: [
    User,
    Category,
    City,
    Tag,
    Item,
    Location,
    ItemCopy,
    Loan,
    EmailNotification,
    ItemCategory,
    ItemTag,
  ],
  synchronize: true,
  dropSchema: true,
};
