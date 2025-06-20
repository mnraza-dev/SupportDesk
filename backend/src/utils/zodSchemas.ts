import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email({ message: 'Valid email is required' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  role: z.enum(['CUSTOMER', 'AGENT', 'ADMIN']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email({ message: 'Valid email is required' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

export const createTicketSchema = z.object({
  subject: z.string().min(3, { message: 'Subject is required' }),
  priority: z.enum(['Low', 'Medium', 'High'], { required_error: 'Priority is required' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
});

export const updateTicketSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'CLOSED']).optional(),
  assignedTo: z.string().optional(),
  message: z.string().min(1, { message: 'Message cannot be empty' }).optional(),
});

export const createAgentSchema = z.object({
  email: z.string().email({ message: 'Valid email is required' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
}); 