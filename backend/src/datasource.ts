import type { DataSourceOptions } from 'typeorm';
import configuration, { DatabaseConfigType } from './config/configuration';
import { resolve } from 'path';
import { config as dotenvConfig } from 'dotenv';

if (!process.env.NODE_ENV && !process.env.DB_DATABASE) {
  dotenvConfig({ path: resolve(__dirname, '../../.env') });
}

const cfg = configuration();
const dbConfig = cfg.database as DatabaseConfigType;

export const dataSourceOptions: DataSourceOptions = {
  type: dbConfig?.type ?? 'sqlite',
  database: dbConfig?.database ?? '',
  host: dbConfig?.host,
  port: dbConfig?.port,
  username: dbConfig?.username,
  password: dbConfig?.password,

  entities: [__dirname + '/**/*.entity.{js,ts}'],
  synchronize: true,
};
