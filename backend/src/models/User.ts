import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'CUSTOMER' | 'AGENT' | 'ADMIN';

export interface IUser extends Document {
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['CUSTOMER', 'AGENT', 'ADMIN'], default: 'CUSTOMER' },
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema); 