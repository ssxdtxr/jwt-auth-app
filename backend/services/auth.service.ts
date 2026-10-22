import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/env';
import { AppError } from '../middleware/error';
import * as tokenRepo from '../repositories/token.repository';
import * as userRepo from '../repositories/user.repository';

const SALT_ROUNDS = config.nodeEnv === 'test' ? 1 : 10;

type Payload = { id: string; email: string };

const signAccess = (payload: Payload): string =>
  jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as SignOptions['expiresIn'],
  });

const signRefresh = (payload: Payload): string =>
  jwt.sign(payload, config.refreshToken.secret, {
    expiresIn: config.refreshToken.expiresIn as SignOptions['expiresIn'],
  });

export const register = async (email: string, password: string): Promise<void> => {
  if (await userRepo.findByEmail(email)) throw new AppError('Пользователь уже существует', 409);
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  await userRepo.create({ id: crypto.randomUUID(), email, password: hash });
};

export const login = async (email: string, password: string) => {
  const user = await userRepo.findByEmail(email);
  const valid = user && (await bcrypt.compare(password, user.password));
  if (!valid) throw new AppError('Неверные учётные данные', 401);

  const payload = { id: user.id, email: user.email };
  const accessToken = signAccess(payload);
  const refreshToken = signRefresh(payload);
  await tokenRepo.add(refreshToken);
  return { accessToken, refreshToken, user: payload };
};

export const refresh = async (token: string | undefined) => {
  if (!token || !(await tokenRepo.has(token))) throw new AppError('Недействительный токен обновления', 401);
  try {
    const { id, email } = jwt.verify(token, config.refreshToken.secret) as { id: string; email: string };
    return { accessToken: signAccess({ id, email }), user: { id, email } };
  } catch {
    await tokenRepo.remove(token);
    throw new AppError('Недействительный токен обновления', 401);
  }
};

export const logout = async (token: string | undefined): Promise<void> => {
  if (token) await tokenRepo.remove(token);
};
