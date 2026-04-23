import mongoose, { Schema, Document, models, model } from "mongoose";

export interface AgentDocument extends Document {
  userId: mongoose.Types.ObjectId;
  folderId?: mongoose.Types.ObjectId;
  name: string;
  template?: string;
  openaiModel: string;
  apiKey: string;
  description: string;
  questions: string;
  tone: string;
  rules: string;
  companyInfo: string;
  language: string;
  industry: string;
  temperature: number;
  top_p: number;
  finalPrompt?: string;
  rawPrompt?: string;
  isDeployed?: boolean;

  // Global usage limit (agent-level, applies across all connections)
  globalLimitEnabled?: boolean;
  globalMessageLimit?: number;
  globalPeriodDays?: number;
  globalPeriodStartDate?: Date;
  globalPeriodEndDate?: Date;
  globalAllowOverage?: boolean;
  globalLimitReachedMessage?: string;
  globalShowLimitMessage?: boolean;
  agentUsageHistory?: {
    periodStart: Date;
    periodEnd: Date;
    totalMessages: number;
    periodDays: number;
    note?: string;
  }[];

  integrations?: {
    type: string;
    name: string;
    description?: string;
    url?: string;
    fields?: { key: string; value: string }[];
    files?: {
      name: string;
      size: number;
      url: string;
      path: string;
      uploadedAt: string;
      isCloud: boolean;
    }[];
    apiKey?: string;
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const AgentSchema = new Schema<AgentDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    folderId: { type: Schema.Types.ObjectId, ref: "Folder" },
    name: { type: String, required: true },
    template: { type: String },
    openaiModel: { type: String, required: true },
    apiKey: { type: String, required: true },
    description: { type: String },
    questions: { type: String },
    tone: { type: String },
    rules: { type: String },
    companyInfo: { type: String },
    language: { type: String },
    industry: { type: String },
    temperature: { type: Number },
    top_p: { type: Number },
    finalPrompt: { type: String },
    rawPrompt: { type: String }, // 🆕 NOUVEAU CHAMP AJOUTÉ
    
    isDeployed: { type: Boolean, default: false },

    // Global usage limit fields
    globalLimitEnabled: { type: Boolean, default: false },
    globalMessageLimit: { type: Number, default: null },
    globalPeriodDays: { type: Number, default: 30, enum: [30, 90, 365] },
    globalPeriodStartDate: { type: Date, default: null },
    globalPeriodEndDate: { type: Date, default: null },
    globalAllowOverage: { type: Boolean, default: false },
    globalLimitReachedMessage: { type: String, default: 'Monthly message limit reached. Please contact support to upgrade your plan.' },
    globalShowLimitMessage: { type: Boolean, default: true },
    agentUsageHistory: [
      {
        periodStart: Date,
        periodEnd: Date,
        totalMessages: { type: Number, default: 0 },
        periodDays: Number,
        note: { type: String, default: null },
      },
    ],

    integrations: [
      {
        type: {
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        description: String,
        url: String,
        fields: [
          {
            key: String,
            value: String,
          },
        ],
        files: [
          {
            name: String,
            size: Number,
            url: String,
            path: String,
            uploadedAt: String,
            isCloud: Boolean,
          },
        ],
        apiKey: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

export const Agent = models.Agent || model<AgentDocument>("Agent", AgentSchema);