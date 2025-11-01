// models/Connection.ts

import mongoose, { Schema, model, models } from 'mongoose'

const ConnectionSchema = new Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  integrationType: { type: String, required: true },
  aiBuildId: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  settings: { type: Schema.Types.Mixed, default: {} },
  
  // Champ folder existant
  folderId: { type: String },
  
  // Champs webhook existants
  webhookId: { type: String },
  webhookSecret: { type: String },
  webhookUrl: { type: String },
  
  // 🆕 NOUVEAUX CHAMPS - Système de partage sécurisé
  shareToken: { 
    type: String, 
    unique: true, 
    sparse: true // Permet null/undefined sans conflit
  },
  shareEnabled: { 
    type: Boolean, 
    default: false 
  },
  sharePermissions: { 
    type: String, 
    enum: ['read-only', 'editable'], 
    default: 'read-only' 
  },
  sharePinCode: { 
    type: String, 
    validate: {
      validator: function(v: string) {
        return !v || /^\d{6}$/.test(v); // 6 chiffres exactement
      },
      message: 'PIN code must be exactly 6 digits'
    }
  },
  sharePinEnabled: { 
    type: Boolean, 
    default: false 
  },
  shareCreatedAt: { 
    type: Date 
  },
  shareLastAccessedAt: { 
    type: Date 
  },
  
  createdAt: { type: Date, default: Date.now },
})

// 🔍 Index pour les requêtes de partage
ConnectionSchema.index({ shareToken: 1 });
ConnectionSchema.index({ userId: 1, integrationType: 1 });

export const Connection = models.Connection || model('Connection', ConnectionSchema)