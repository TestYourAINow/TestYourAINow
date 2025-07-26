// /models/AgentKnowledge.ts
import mongoose, { Schema, Document, models, model } from "mongoose";

export interface AgentKnowledgeDocument extends Document {
  agentId: mongoose.Types.ObjectId | string;
  fileName: string;
  path: string;
  content: string;
  createdAt: Date;
  updatedAt: Date; // ⭐ Ajouté automatiquement par timestamps: true
  sourceName?: string;
}

const AgentKnowledgeSchema = new Schema<AgentKnowledgeDocument>(
  {
    agentId: { type: Schema.Types.ObjectId, ref: "Agent", required: true },
    fileName: { type: String, required: true },
    path: { type: String, required: true },
    content: { type: String, required: true },
    sourceName: { type: String },
    // ❌ SUPPRIMÉ : createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true } // ⭐ Ça gère createdAt ET updatedAt automatiquement !
);

export const AgentKnowledge =
  models.AgentKnowledge || model<AgentKnowledgeDocument>("AgentKnowledge", AgentKnowledgeSchema);