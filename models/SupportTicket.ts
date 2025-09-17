// models/SupportTicket.ts (UPDATED - Sans Priority)
import mongoose, { Schema, Document, models, model } from "mongoose";

export interface SupportTicketDocument extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  category: string;
  status: 'pending' | 'open' | 'closed'; // 🔧 Seulement 3 statuts
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
      enum: ['pending', 'open', 'closed'], // 🔧 Supprimé 'resolved'
      default: 'pending' // 🔧 Changé de 'open' à 'pending'
    },
  },
  { timestamps: true }
);

export const SupportTicket = models.SupportTicket || model<SupportTicketDocument>("SupportTicket", SupportTicketSchema);