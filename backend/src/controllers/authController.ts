import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";
import logger from '../utils/logger';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      logger.warn('Registration failed: Email already in use (%s)', email);
      res.status(409).json({ message: 'Email already in use.' });
      return;
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashed, role });
    logger.info('User registered: %s (role: %s)', user.email, user.role);
    res.status(201).json({ id: user._id, email: user.email, role: user.role });
  } catch (err) {
    logger.error('Registration error: %o', err);
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn('Login failed: Invalid credentials for %s', email);
      res.status(401).json({ message: 'Invalid credentials.' });
      return;
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      logger.warn('Login failed: Invalid credentials for %s', email);
      res.status(401).json({ message: 'Invalid credentials.' });
      return;
    }
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );
    logger.info('User logged in: %s (role: %s)', user.email, user.role);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week
    });
    res.json({ user: { id: user._id, email: user.email, role: user.role } });
  } catch (err) {
    logger.error('Login error: %o', err);
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    res.json({ message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated.' });
      return;
    }
    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (err) {
    next(err);
  }
} 