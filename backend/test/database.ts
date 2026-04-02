import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '@/user/user.entity';

export const dbConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: ':memory:',
  entities: [User],
  synchronize: true,
  dropSchema: true,
};
