import { Request, Response, NextFunction } from 'express';
import Ticket from '../models/Ticket';
import { broadcastTicketEvent } from '../index';
import logger from '../utils/logger';

export async function createTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { subject, title, description, priority } = req.body;
    const ticket = await Ticket.create({
      subject: subject || title,
      priority: priority || 'Medium',
      description,
      createdBy: req.user.id,
      status: 'OPEN',
      messages: [],
    });
    logger.info('Ticket created: %s by user %s', ticket._id, req.user.id);
    broadcastTicketEvent({ type: 'ticket_created', ticket, action: 'create' });
    res.status(201).json(ticket);
  } catch (err) {
    logger.error('Create ticket error: %o', err);
    next(err);
  }
}

export async function listTickets(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let tickets;
    if (req.user.role === 'CUSTOMER') {
      tickets = await Ticket.find({ createdBy: req.user.id }).populate('createdBy assignedTo', 'email role').lean();
    } else if (req.user.role === 'AGENT') {
      tickets = await Ticket.find({ $or: [ { assignedTo: req.user.id }, { assignedTo: null } ] }).populate('createdBy assignedTo', 'email role').lean();
    } else {
      // ADMIN
      tickets = await Ticket.find().populate('createdBy assignedTo', 'email role').lean();
    }
    // Add submitter field for frontend filtering
    tickets = tickets.map(ticket => ({
      ...ticket,
      submitter:
        ticket.createdBy && typeof ticket.createdBy === 'object' && 'email' in ticket.createdBy
          ? ticket.createdBy.email
          : '',
    }));
    res.json({ tickets, total: tickets.length });
  } catch (err) {
    logger.error('List tickets error: %o', err);
    next(err);
  }
}

export async function getTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const ticket = await Ticket.findById(req.params.id).populate('createdBy assignedTo messages.sender', 'email role');
    if (!ticket) {
      logger.warn('Ticket not found: %s', req.params.id);
      res.status(404).json({ message: 'Ticket not found.' });
      return;
    }
    res.json(ticket);
  } catch (err) {
    logger.error('Get ticket details error: %o', err);
    next(err);
  }
}

export async function updateTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      logger.warn('Ticket not found for update: %s', req.params.id);
      res.status(404).json({ message: 'Ticket not found.' });
      return;
    }
    let statusChanged = false;
    let assigneeChanged = false;
    let newMessage = null;
    // Only agent or admin can update status/assign
    if (req.body.status && (req.user.role === 'AGENT' || req.user.role === 'ADMIN')) {
      if (ticket.status !== req.body.status) {
        ticket.status = req.body.status;
        statusChanged = true;
      }
    }
    if (req.body.assignedTo && (req.user.role === 'AGENT' || req.user.role === 'ADMIN')) {
      if (String(ticket.assignedTo) !== String(req.body.assignedTo)) {
        ticket.assignedTo = req.body.assignedTo;
        assigneeChanged = true;
      }
    }
    // Anyone can add a message
    if (req.body.message) {
      newMessage = { sender: req.user.id, message: req.body.message, createdAt: new Date() };
      ticket.messages.push(newMessage);
    }
    await ticket.save();
    const updated = await Ticket.findById(ticket._id).populate('createdBy assignedTo messages.sender', 'email role');
    if (!updated) {
      logger.warn('Ticket not found after update: %s', ticket._id);
      res.status(404).json({ message: 'Ticket not found after update.' });
      return;
    }
    logger.info('Ticket updated: %s by user %s', ticket._id, req.user.id);
    if (statusChanged) {
      broadcastTicketEvent({ type: 'ticket_status_update', ticket: updated, status: updated.status });
    }
    if (assigneeChanged) {
      broadcastTicketEvent({ type: 'ticket_assigned', ticket: updated, assignee: updated.assignedTo });
    }
    if (newMessage) {
      broadcastTicketEvent({ type: 'new_message', ticket: updated, message: newMessage, ticketId: updated._id });
    }
    broadcastTicketEvent({ type: 'ticket_updated', ticket: updated, action: 'update' });
    res.json(updated);
  } catch (err) {
    logger.error('Update ticket error: %o', err);
    next(err);
  }
} 