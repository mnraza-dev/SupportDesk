import express from 'express';
import { createTicket, listTickets, getTicket, updateTicket } from '../controllers/ticketController';
import { validateBody } from '../middlewares/validate';
import { createTicketSchema, updateTicketSchema } from '../utils/zodSchemas';
import { authMiddleware } from '../middlewares/auth';

const router = express.Router();

router.post('/', authMiddleware, validateBody(createTicketSchema), createTicket);
router.get('/', authMiddleware, listTickets);
router.get('/:id', authMiddleware, getTicket);
router.put('/:id', authMiddleware, validateBody(updateTicketSchema), updateTicket);

export default router; 