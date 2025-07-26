import mongoose, { Schema, Document, models, model } from "mongoose";

export interface FolderDocument extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

const FolderSchema = new Schema<FolderDocument>(
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
FolderSchema.index({ userId: 1, createdAt: -1 });

export const Folder = models.Folder || model<FolderDocument>("Folder", FolderSchema);