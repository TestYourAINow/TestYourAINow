// models/SupportTicket.ts
import mongoose, { Schema, Document, models, model } from "mongoose";

export interface SupportTicketDocument extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'pending' | 'resolved' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

const SupportTicketSchema = new Schema<SupportTicketDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    priority: { 
      type: String, 
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    status: { 
      type: String, 
      enum: ['open', 'pending', 'resolved', 'closed'],
      default: 'open'
    },
  },
  { timestamps: true }
);

export const SupportTicket = models.SupportTicket || model<SupportTicketDocument>("SupportTicket", SupportTicketSchema);