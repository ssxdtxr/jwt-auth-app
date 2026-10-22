import { AppDataSource } from '../db/data-source';
import { User } from '../entities/User';

const repo = () => AppDataSource.getRepository(User);

export const findByEmail = (email: string): Promise<User | null> =>
  repo().findOneBy({ email });

export const create = (data: Pick<User, 'id' | 'email' | 'password'>): Promise<User> =>
  repo().save(repo().create(data));

// For testing only — removes all rows
export const __resetStore = (): Promise<void> =>
  AppDataSource.query('DELETE FROM users').then(() => undefined);
