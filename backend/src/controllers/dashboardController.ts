import { Request, Response, NextFunction } from 'express';
import Ticket from '../models/Ticket';
import User from '../models/User';
import logger from '../utils/logger';

export async function getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [open, inProgress, closed, totalUsers, totalAgents] = await Promise.all([
      Ticket.countDocuments({ status: 'OPEN' }),
      Ticket.countDocuments({ status: 'IN_PROGRESS' }),
      Ticket.countDocuments({ status: 'CLOSED' }),
      User.countDocuments(),
      User.countDocuments({ role: 'AGENT' }),
    ]);
    res.json({
      tickets: {
        open,
        inProgress,
        closed,
      },
      users: {
        total: totalUsers,
        agents: totalAgents,
      },
    });
  } catch (err) {
    logger.error('Dashboard summary error: %o', err);
    next(err);
  }
}

export async function getAgentStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const agents = await User.find({ role: 'AGENT' }).select('email');
    const stats = await Promise.all(
      agents.map(async (agent) => {
        const count = await Ticket.countDocuments({ assignedTo: agent._id });
        return { agent: { id: agent._id, email: agent.email }, ticketCount: count };
      })
    );
    res.json(stats);
  } catch (err) {
    logger.error('Dashboard agent-stats error: %o', err);
    next(err);
  }
} 