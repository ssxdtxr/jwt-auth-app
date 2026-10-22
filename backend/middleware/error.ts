import { ErrorRequestHandler } from 'express';

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const statusCode = (err as AppError).statusCode ?? 500;
  if (statusCode >= 500) {
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.path} →`, err.message);
  }
  const message = statusCode < 500 ? err.message : 'Внутренняя ошибка сервера';
  res.status(statusCode).json({ message });
};
