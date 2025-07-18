// /models/AgentKnowledge.ts
import mongoose, { Schema, Document, models, model } from "mongoose";

export interface AgentKnowledgeDocument extends Document {
  agentId: mongoose.Types.ObjectId | string;
  fileName: string;
  path: string;
  content: string;
  createdAt: Date;
  sourceName?: string; // <- ajouté ici
}

const AgentKnowledgeSchema = new Schema<AgentKnowledgeDocument>(
  {
    agentId: { type: Schema.Types.ObjectId, ref: "Agent", required: true },
    fileName: { type: String, required: true },
    path: { type: String, required: true },
    content: { type: String, required: true },
    sourceName: { type: String }, // <- ajouté ici
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const AgentKnowledge =
  models.AgentKnowledge || model<AgentKnowledgeDocument>("AgentKnowledge", AgentKnowledgeSchema);
