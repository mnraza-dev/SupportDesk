import express from 'express';
import { register, login, getMe, logout } from '../controllers/authController';
import { validateBody } from '../middlewares/validate';
import { registerSchema, loginSchema } from '../utils/zodSchemas';
import { authMiddleware } from '../middlewares/auth';

const router = express.Router();

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.post('/logout', logout);
router.get('/me', authMiddleware, getMe);

export default router; 