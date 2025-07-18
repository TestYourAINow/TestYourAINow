import mongoose, { Schema, Document, models, Types } from "mongoose";

export interface AgentVersionDocument extends Document {
  agentId: Types.ObjectId;
  prompt: string;
  openaiModel: string;
  temperature: number;
  top_p: number;
  createdAt: Date;
  integrations?: {
    type: string;
    name: string;
    description?: string;
    url?: string;
    fields?: { key: string; value: string }[];
    files?: string[];
    apiKey?: string;
    createdAt: Date;
  }[];
}

const AgentVersionSchema = new Schema<AgentVersionDocument>({
  agentId: {
    type: Schema.Types.ObjectId,
    ref: "Agent",
    required: true,
  },
  prompt: { type: String, required: true },
  openaiModel: { type: String, required: true },
  temperature: { type: Number, required: true },
  top_p: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  integrations: [{
    type: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    url: { type: String },
    fields: [{
      key: { type: String, required: true },
      value: { type: String, required: true }
    }],
    files: [{ type: String }],
    apiKey: { type: String },
    createdAt: { type: Date, default: Date.now }
  }]
});

const AgentVersion =
  models.AgentVersion || mongoose.model<AgentVersionDocument>("AgentVersion", AgentVersionSchema);

export { AgentVersion };