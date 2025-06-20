import express, { Request, Response, NextFunction } from 'express';
import { getSummary, getAgentStats } from '../controllers/dashboardController';
import { authMiddleware } from '../middlewares/auth';

// Extend Express Request to include user
// (If already declared globally, this is a no-op)
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const router = express.Router();

// Only allow AGENT or ADMIN
function agentOrAdminOnly(req: Request, res: Response, next: NextFunction): void {
  if (req.user.role !== 'AGENT' && req.user.role !== 'ADMIN') {
    res.status(403).json({ message: 'Agent or admin access required.' });
    return;
  }
  next();
}

// GET /summary: ticket counts by status, total users, total agents
router.get('/summary', authMiddleware, agentOrAdminOnly, getSummary);

// GET /agent-stats: ticket counts per agent
router.get('/agent-stats', authMiddleware, agentOrAdminOnly, getAgentStats);

export default router; 