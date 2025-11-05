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
  
  // Champs de partage existants
  shareToken: { 
    type: String, 
    unique: true, 
    sparse: true
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
        return !v || /^\d{6}$/.test(v);
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
  
  // 🆕 NOUVEAU - SYSTÈME DE LIMITE MENSUELLE
  limitEnabled: {
    type: Boolean,
    default: false
  },
  messageLimit: {
    type: Number,
    default: null
  },
  currentPeriodUsage: {
    type: Number,
    default: 0
  },
  periodStartDate: {
    type: Date,
    default: null
  },
  periodEndDate: {
    type: Date,
    default: null
  },
  periodDays: {
    type: Number,
    default: 30,
    enum: [30, 90, 365]
  },
  
  // 🆕 MODE OVERAGE (dépassement autorisé)
  allowOverage: {
    type: Boolean,
    default: false
  },
  overageCount: {
    type: Number,
    default: 0
  },
  
  // 🆕 MESSAGES PERSONNALISÉS
  limitReachedMessage: {
    type: String,
    default: 'Monthly message limit reached. Please contact support to upgrade your plan.'
  },
  showLimitMessage: {
    type: Boolean,
    default: true
  },
  
  // 🆕 HISTORIQUE DES PÉRIODES
  usageHistory: [{
    period: String,
    messagesUsed: Number,
    overageMessages: { type: Number, default: 0 },
    startDate: Date,
    endDate: Date,
    note: String,
    createdAt: { type: Date, default: Date.now }
  }],
  
  createdAt: { type: Date, default: Date.now },
})

// Index pour les requêtes de partage
ConnectionSchema.index({ shareToken: 1 });
ConnectionSchema.index({ userId: 1, integrationType: 1 });
ConnectionSchema.index({ limitEnabled: 1, periodEndDate: 1 });

export const Connection = models.Connection || model('Connection', ConnectionSchema)