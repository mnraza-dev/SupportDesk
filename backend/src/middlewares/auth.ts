import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.token;
  if (!token) {
    logger.warn('No token provided in cookies');
    res.status(401).json({ message: 'No token provided.' });
    return;
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (err) {
    logger.warn('Invalid token: %o', err);
    res.status(401).json({ message: 'Invalid token.' });
  }
} 