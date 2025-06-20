import express, { Request, Response, NextFunction } from 'express';
import { listAgents, createAgent, deleteAgent } from '../controllers/agentController';
import { validateBody } from '../middlewares/validate';
import { createAgentSchema } from '../utils/zodSchemas';
import { authMiddleware } from '../middlewares/auth';

const router = express.Router();
function adminOnly(req: Request, res: Response, next: NextFunction) {
  if (req.user.role !== 'ADMIN') {
    res.status(403).json({ message: 'Admin access required.' });
    return;
  }
  next();
}

router.get('/', authMiddleware, adminOnly, listAgents);
router.post('/', authMiddleware, adminOnly, validateBody(createAgentSchema), createAgent);
router.delete('/:id', authMiddleware, adminOnly, deleteAgent);

export default router; 