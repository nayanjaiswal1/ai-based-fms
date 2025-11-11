import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as path from 'path';

export const databaseConfig = registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    username: process.env.DATABASE_USER || 'fms_user',
    password: process.env.DATABASE_PASSWORD || 'fms_password',
    database: process.env.DATABASE_NAME || 'fms_db',
    entities: [path.join(__dirname, '../database/entities/**/*.entity{.ts,.js}')],
    migrations: [path.join(__dirname, '../database/migrations/**/*{.ts,.js}')],
    synchronize: process.env.NODE_ENV === 'development',
    logging: process.env.NODE_ENV === 'development',
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
    extra: {
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    },
  }),
);

// DataSource for migrations
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  username: process.env.DATABASE_USER || 'fms_user',
  password: process.env.DATABASE_PASSWORD || 'fms_password',
  database: process.env.DATABASE_NAME || 'fms_db',
  entities: [path.join(__dirname, '../database/entities/**/*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, '../database/migrations/**/*{.ts,.js}')],
  synchronize: false,
  logging: false,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
