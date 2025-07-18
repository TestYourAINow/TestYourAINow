import mongoose, { Schema, model, models } from 'mongoose';

const DemoSchema = new Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  agentId: { type: String, required: true },
  
  // Apparence
  theme: { type: String, default: 'dark' },
  color: { type: String, default: '#007bff' },
  avatarUrl: { type: String, default: '' },
  
  // Messages
  showWelcome: { type: Boolean, default: true },
  welcomeMessage: { type: String, default: 'Hello! How can I help you today?' },
  placeholderText: { type: String, default: 'Type your message...' },
  
  // Chat info
  chatTitle: { type: String, default: 'Assistant IA' },
  subtitle: { type: String, default: 'En ligne' },
  
  // Popup
  showPopup: { type: Boolean, default: true },
  popupMessage: { type: String, default: 'Hello! Need any help?' },
  popupDelay: { type: Number, default: 2 },
  
  // Usage
  usageLimit: { type: Number, default: 150 },
  usedCount: { type: Number, default: 0 },
  
  // Dates
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true }
});

export const Demo = models.Demo || model('Demo', DemoSchema);