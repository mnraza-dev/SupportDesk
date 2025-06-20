import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
 
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  logger.error('Unhandled error: %o', err);
  res.status(500).json({ message: 'Internal server error.' });
} 