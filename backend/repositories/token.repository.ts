import { AppDataSource } from '../db/data-source';
import { RefreshToken } from '../entities/RefreshToken';

const repo = () => AppDataSource.getRepository(RefreshToken);

export const add = async (token: string): Promise<void> => {
  await repo().save(repo().create({ token }));
};

export const has = async (token: string): Promise<boolean> => {
  const count = await repo().countBy({ token });
  return count > 0;
};

export const remove = async (token: string): Promise<void> => {
  await repo().delete({ token });
};

// For testing only — removes all rows
export const __resetStore = (): Promise<void> =>
  AppDataSource.query('DELETE FROM refresh_tokens').then(() => undefined);
