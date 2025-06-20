import mongoose, { Document, Schema, Types } from 'mongoose';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED';

export interface IMessage {
  sender: Types.ObjectId;
  message: string;
  createdAt: Date;
}

export interface ITicket extends Document {
  subject: string;
  priority: string;
  title: string;
  description: string;
  status: TicketStatus;
  createdBy: Types.ObjectId;
  assignedTo?: Types.ObjectId;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const TicketSchema = new Schema<ITicket>({
  subject: { type: String, required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium', required: true },
  title: { type: String },
  description: { type: String, required: true },
  status: { type: String, enum: ['OPEN', 'IN_PROGRESS', 'CLOSED'], default: 'OPEN' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  messages: [MessageSchema],
}, { timestamps: true });

export default mongoose.model<ITicket>('Ticket', TicketSchema); 