import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth';

export const userRouter: Router = Router();

userRouter.get('/me', authMiddleware, userController.getMe);
