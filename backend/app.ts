import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { config } from './config/env';
import { errorHandler } from './middleware/error';
import { authRouter } from './routes/auth.routes';
import { userRouter } from './routes/user.routes';

export const app = express();

app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRouter);
app.use('/user', userRouter);

// Global error handler must be last
app.use(errorHandler);
