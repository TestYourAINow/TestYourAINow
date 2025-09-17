// models/TicketMessage.ts
import mongoose, { Schema, Document, models, model } from "mongoose";

export interface TicketMessageDocument extends Document {
  ticketId: mongoose.Types.ObjectId;
  senderType: 'user' | 'support';
  senderName: string;
  senderEmail?: string;
  message: string;
  attachments?: {
    type: string;
    url: string;
    filename: string;
    size: number;
    path: string;
  }[];
  createdAt: Date;
}

const TicketMessageSchema = new Schema<TicketMessageDocument>(
  {
    ticketId: { type: Schema.Types.ObjectId, ref: "SupportTicket", required: true },
    senderType: { 
      type: String, 
      enum: ['user', 'support'],
      required: true 
    },
    senderName: { type: String, required: true },
    senderEmail: { type: String },
    message: { type: String, required: true },
    attachments: [{
      type: { type: String },
      url: { type: String },
      filename: { type: String },
      size: { type: Number },
      path: { type: String }
    }]
  },
  { timestamps: true }
);

export const TicketMessage = models.TicketMessage || model<TicketMessageDocument>("TicketMessage", TicketMessageSchema);