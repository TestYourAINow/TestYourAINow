import mongoose, { Schema, Document } from "mongoose";

export interface DeploymentFolderDocument extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  color: string;
  connectionCount: number;  // ✅ IMPORTANT
  createdAt: Date;
  updatedAt: Date;
}

const DeploymentFolderSchema = new Schema<DeploymentFolderDocument>(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    name: { 
      type: String, 
      required: true,
      trim: true,
      maxlength: 50
    },
    description: { 
      type: String,
      trim: true,
      maxlength: 200
    },
    color: { 
      type: String, 
      required: true,
      match: /^#[0-9A-F]{6}$/i
    },
    connectionCount: {  // ✅ AJOUTÉ ICI
      type: Number,
      default: 0,
      min: 0
    }
  },
  { 
    timestamps: true 
  }
);

DeploymentFolderSchema.index({ userId: 1, createdAt: -1 });

// 🔥 FORCER LE DELETE DU MODÈLE AVANT DE LE RECRÉER
if (mongoose.models.DeploymentFolder) {
  delete mongoose.models.DeploymentFolder;
}

export const DeploymentFolder = mongoose.model<DeploymentFolderDocument>("DeploymentFolder", DeploymentFolderSchema);