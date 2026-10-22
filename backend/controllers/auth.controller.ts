import { NextFunction, Request, Response } from 'express';
import { config } from '../config/env';
import * as authService from '../services/auth.service';

const COOKIE_OPTS = {
  httpOnly: true,
  secure: config.nodeEnv === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      res.status(400).json({ message: 'Email и пароль обязательны' });
      return;
    }
    await authService.register(email, password);
    res.status(201).json({ message: 'Регистрация прошла успешно' });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const { accessToken, refreshToken, user } = await authService.login(email, password);
    res.cookie('refreshToken', refreshToken, COOKIE_OPTS).json({ accessToken, user });
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await authService.refresh(req.cookies?.refreshToken as string | undefined);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await authService.logout(req.cookies?.refreshToken as string | undefined);
    res.clearCookie('refreshToken', COOKIE_OPTS).json({ message: 'Выход выполнен' });
  } catch (err) {
    next(err);
  }
};
