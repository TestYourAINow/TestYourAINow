import mongoose, { Schema, Document, models, model } from "mongoose";

export interface DeploymentFolderDocument extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  color: string;
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
      match: /^#[0-9A-F]{6}$/i // Validation couleur hex
    }
  },
  { 
    timestamps: true 
  }
);

// Index pour performance
DeploymentFolderSchema.index({ userId: 1, createdAt: -1 });

// 🔧 CORRECTION - Cast explicite du type
export const DeploymentFolder = (models.DeploymentFolder || model<DeploymentFolderDocument>("DeploymentFolder", DeploymentFolderSchema)) as mongoose.Model<DeploymentFolderDocument>;