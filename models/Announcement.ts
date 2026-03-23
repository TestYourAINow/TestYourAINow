import mongoose, { Schema, model, models, Document } from 'mongoose';

export interface AnnouncementDocument extends Document {
  title: string;
  message: string;
  type: 'update' | 'feature' | 'maintenance' | 'info';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema = new Schema<AnnouncementDocument>({
  title: { type: String, required: true, maxlength: 100 },
  message: { type: String, required: true, maxlength: 1000 },
  type: {
    type: String,
    enum: ['update', 'feature', 'maintenance', 'info'],
    default: 'update'
  },
  isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true });

export const Announcement = models.Announcement || model<AnnouncementDocument>('Announcement', AnnouncementSchema);
