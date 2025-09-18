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
  rawPrompt?: string; // 🆕 NOUVEAU CHAMP AJOUTÉ
  
  // 🆕 NOUVEAU CHAMP - SÉCURITAIRE
  isDeployed?: boolean; // Optionnel pour ne pas casser l'existant
  
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
    
    // 🆕 NOUVEAU CHAMP - SÉCURITAIRE
    isDeployed: { 
      type: Boolean, 
      default: false // Défaut à false pour tous les agents existants
    },
    
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