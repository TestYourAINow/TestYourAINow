// models/ChatbotConfig.ts - Version mise à jour avec connectionId

import mongoose from 'mongoose';

const ChatbotConfigSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  
  // 🆕 NOUVEAU - Lien avec Connection
  connectionId: {
    type: String,
    index: true // Pour les requêtes rapides
  },
  
  name: { type: String, required: true },
  avatar: { type: String },
  welcomeMessage: { type: String },
  placeholderText: { type: String },
  typingText: { type: String },
  theme: { 
    type: String, 
    enum: ['light', 'dark'], 
    default: 'light' 
  },
  primaryColor: { type: String, default: '#22c55e' },
  width: { type: Number, default: 380 },
  height: { type: Number, default: 500 },
  placement: { 
    type: String, 
    enum: ['bottom-right', 'bottom-left', 'top-right', 'top-left'],
    default: 'bottom-right'
  },
  popupMessage: { type: String },
  popupDelay: { type: Number, default: 3 },
  showPopup: { type: Boolean, default: false },
  showWelcomeMessage: { type: Boolean, default: true },
  selectedAgent: { type: String, required: true },
  chatTitle: { type: String },
  subtitle: { type: String, default: 'En ligne' },
  
  // Métadonnées
  isActive: { type: Boolean, default: true },
  deployedAt: { type: Date },
  lastActivity: { type: Date }
}, {
  timestamps: true
});

// 🔍 Index pour les requêtes fréquentes
ChatbotConfigSchema.index({ userId: 1, isActive: 1 });
ChatbotConfigSchema.index({ selectedAgent: 1 });
ChatbotConfigSchema.index({ connectionId: 1, userId: 1 }); // 🆕 NOUVEAU INDEX

// 🗑️ Middleware pour suppression en cascade
ChatbotConfigSchema.pre('deleteOne', { document: true, query: false }, function() {
  console.log(`🗑️ [CASCADE] ChatbotConfig ${this._id} is being deleted`);
});

export const ChatbotConfig = mongoose.models.ChatbotConfig || 
  mongoose.model('ChatbotConfig', ChatbotConfigSchema);