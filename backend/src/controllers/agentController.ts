import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import bcrypt from 'bcrypt';
import logger from '../utils/logger';

export async function listAgents(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const agents = await User.find({ role: 'AGENT' }).select('-password');
    res.json(agents);
  } catch (err) {
    logger.error('List agents error: %o', err);
    next(err);
  }
}

export async function createAgent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      logger.warn('Agent creation failed: Email already in use (%s)', email);
      res.status(409).json({ message: 'Email already in use.' });
      return;
    }
    const hashed = await bcrypt.hash(password, 10);
    const agent = await User.create({ email, password: hashed, role: 'AGENT' });
    logger.info('Agent created: %s', agent.email);
    res.status(201).json({ id: agent._id, email: agent.email, role: agent.role });
  } catch (err) {
    logger.error('Create agent error: %o', err);
    next(err);
  }
}

export async function deleteAgent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const agent = await User.findById(req.params.id);
    if (!agent || agent.role !== 'AGENT') {
      logger.warn('Delete agent failed: Agent not found (%s)', req.params.id);
      res.status(404).json({ message: 'Agent not found.' });
      return;
    }
    await agent.deleteOne();
    logger.info('Agent deleted: %s', agent.email);
    res.json({ message: 'Agent deleted.' });
  } catch (err) {
    logger.error('Delete agent error: %o', err);
    next(err);
  }
} 