import { Schema, model, models, Document } from 'mongoose';

export interface AnnouncementDocument extends Document {
  title: string;
  message: string;
  type: 'update' | 'feature' | 'maintenance' | 'info';
  imageUrl?: string;
  imageLayout?: 'banner' | 'thumbnail';
  isActive: boolean;
  status: 'draft' | 'published';
  publishedAt?: Date | null;
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
  imageUrl: { type: String, default: '' },
  imageLayout: { type: String, enum: ['banner', 'thumbnail'], default: 'thumbnail' },
  isActive: { type: Boolean, default: true, index: true },
  status: { type: String, enum: ['draft', 'published'], default: 'published', index: true },
  publishedAt: { type: Date, default: null },
}, { timestamps: true });

export const Announcement = models.Announcement || model<AnnouncementDocument>('Announcement', AnnouncementSchema);
