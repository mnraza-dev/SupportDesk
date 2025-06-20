import mongoose from 'mongoose';
import logger from '../utils/logger';

export async function connectDB(MONGO_URI: string) {
  try {
    await mongoose.connect(MONGO_URI);
    logger.info('Connected to MongoDB');
  } catch (err) {
    logger.error('Failed to connect to MongoDB: %o', err);
    process.exit(1);
  }
} 