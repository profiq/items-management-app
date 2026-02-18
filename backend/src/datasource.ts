import configuration, { DatabaseConfigType } from './config/configuration';
import { resolve } from 'path';
import { config as dotenvConfig } from 'dotenv';
import { DataSource, type DataSourceOptions } from 'typeorm';

if (!process.env.NODE_ENV && !process.env.DB_DATABASE) {
  dotenvConfig({ path: resolve(__dirname, '../../.env') });
}

const cfg = configuration();
const dbConfig = cfg.database as DatabaseConfigType;

export const dataSourceOptions: DataSourceOptions = {
  type: dbConfig.type ?? 'sqlite',
  database: dbConfig.database ?? '',
  host: dbConfig?.host,
  port: dbConfig?.port,
  username: dbConfig?.username,
  password: dbConfig?.password,

  entities: [__dirname + '/**/*.entity.{js,ts}'],
  synchronize: process.env.NODE_ENV != 'production',
  migrations:
    process.env.NODE_ENV == 'production'
      ? [__dirname + '/db/migrations/**/*{.js,.ts}']
      : [],
  migrationsRun: process.env.NODE_ENV == 'production',
};

export const dataSource = new DataSource(dataSourceOptions);
