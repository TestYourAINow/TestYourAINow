// models/SupportTicket.ts
import mongoose, { Schema, Document, models, model } from "mongoose";

export interface SupportTicketDocument extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  category: string;
  status: 'pending' | 'open' | 'closed';
  closedAt?: Date; // NEW: Track when ticket was closed for auto-deletion
  createdAt: Date;
  updatedAt: Date;
}

const SupportTicketSchema = new Schema<SupportTicketDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['pending', 'open', 'closed'],
      default: 'pending'
    },
    closedAt: { type: Date }, // NEW: Set when status changes to 'closed'
  },
  { timestamps: true }
);

export const SupportTicket = models.SupportTicket || model<SupportTicketDocument>("SupportTicket", SupportTicketSchema);