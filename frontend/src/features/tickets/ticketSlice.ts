import { createSlice,type PayloadAction } from '@reduxjs/toolkit';

export interface Message {
  sender: string;
  text: string;
  time: string;
  fileName?: string;
}

export interface Ticket {
  id: number;
  subject: string;
  priority: string;
  description: string;
  status: string;
  assignee?: string;
  submitter: string;
  messages?: Message[];
}

const initialState: Ticket[] = [
  {
    id: 1,
    subject: 'Login not working',
    status: 'Open',
    priority: 'High',
    assignee: 'Alice',
    submitter: 'customer1@example.com',
    description: 'Cannot log in with my credentials.',
    messages: [
      { sender: 'customer1@example.com', text: 'Hello, I need help!', time: '09:00' },
      { sender: 'agent@example.com', text: 'I am looking into it.', time: '09:05' },
    ],
  },
  {
    id: 2,
    subject: 'UI glitch on dashboard',
    status: 'In Progress',
    priority: 'Medium',
    assignee: 'Bob',
    submitter: 'customer2@example.com',
    description: 'Dashboard widgets overlap.',
    messages: [],
  },
  {
    id: 3,
    subject: 'Feature request: dark mode',
    status: 'Closed',
    priority: 'Low',
    assignee: 'Charlie',
    submitter: 'customer1@example.com',
    description: 'Please add dark mode.',
    messages: [],
  },
];

const ticketSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    addTicket: (state, action: PayloadAction<Ticket>) => {
      state.push(action.payload);
    },
    addMessage: (state, action: PayloadAction<{ ticketId: number; message: Message }>) => {
      const ticket = state.find(t => t.id === action.payload.ticketId);
      if (ticket) {
        if (!ticket.messages) ticket.messages = [];
        ticket.messages.push(action.payload.message);
      }
    },
    updateTicket: (state, action: PayloadAction<{ ticketId: number; status?: string; priority?: string }>) => {
      const ticket = state.find(t => t.id === action.payload.ticketId);
      if (ticket) {
        if (action.payload.status) ticket.status = action.payload.status;
        if (action.payload.priority) ticket.priority = action.payload.priority;
      }
    },
    setTickets: (state, action: PayloadAction<Ticket[]>) => {
      return action.payload;
    },
  },
});

export const { addTicket, addMessage, updateTicket, setTickets } = ticketSlice.actions;
export default ticketSlice.reducer;
