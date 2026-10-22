import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from '../config/env';
import { RefreshToken } from '../entities/RefreshToken';
import { User } from '../entities/User';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: config.db.url,
  entities: [User, RefreshToken],
  synchronize: true,
  logging: config.nodeEnv === 'development',
});

export const initDb = async (): Promise<void> => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
};
