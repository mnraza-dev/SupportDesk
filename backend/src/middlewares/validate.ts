import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import logger from '../utils/logger';

export function validateBody(schema: ZodSchema<any>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      logger.warn('Validation failed: %o', result.error.errors);
      res.status(400).json({ errors: result.error.errors });
      return;
    }
    req.body = result.data;
    next();
  };
} 