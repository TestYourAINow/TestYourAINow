import mongoose, { Schema, model, models } from 'mongoose';

const UserDomainSchema = new Schema({
  userId: { type: String, required: true },
  domain: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'verified', 'failed'],
    default: 'pending'
  },
  verifiedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  
  // Infos de vérification
  lastChecked: { type: Date, default: null },
  errorMessage: { type: String, default: null }
});

// Index unique pour éviter les doublons
UserDomainSchema.index({ userId: 1, domain: 1 }, { unique: true });

export const UserDomain = models.UserDomain || model('UserDomain', UserDomainSchema);