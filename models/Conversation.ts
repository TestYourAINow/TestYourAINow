// models\Conversation.ts

import mongoose, { Schema, model, models, Document } from 'mongoose'

// 📊 Interface pour un message individuel
interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  isFiltered?: boolean // Pour savoir si le message est exclu du contexte OpenAI
}

// 📊 Interface pour une conversation complète
export interface ConversationDocument extends Document {
  // 🔗 Identifiants
  conversationId: string        // Format: "webhookId_userId"
  connectionId: string          // ID de la connection MongoDB
  userId: string                // contactId ManyChat
  webhookId: string            // ID du webhook
  
  // 📊 Métadonnées
  platform: 'instagram-dms' | 'facebook-messenger' | 'sms' | 'website-widget' | 'webhook'
  platformDetails?: string
  agentId: string              // ID de l'agent utilisé
  agentName?: string           // Nom de l'agent (dénormalisé pour performance)
  
  // 🆕 NOUVELLES DONNÉES UTILISATEUR (ajoutées)
  userFirstName?: string       // Prénom de l'utilisateur
  userLastName?: string        // Nom de famille de l'utilisateur  
  userFullName?: string        // Nom complet (calculé automatiquement)
  userProfilePic?: string      // URL de la photo de profil
  userUsername?: string        // Username Instagram/Facebook
  userGender?: string          // Genre (si disponible)
  userLocale?: string          // Langue/région
  userTimezone?: string        // Fuseau horaire
  
  // 💬 Messages
  messages: ConversationMessage[]
  
  // 📈 Stats
  messageCount: number
  userMessageCount: number
  assistantMessageCount: number
  
  // 🕐 Timestamps
  firstMessageAt: Date
  lastMessageAt: Date
  lastUserMessageAt?: Date
  lastAssistantMessageAt?: Date
  
  // 🗑️ Gestion
  isDeleted: boolean           // Soft delete
  deletedAt?: Date
  
  // 📋 Système
  createdAt: Date
  updatedAt: Date
}

const ConversationMessageSchema = new Schema<ConversationMessage>({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Number,
    required: true
  },
  isFiltered: {
    type: Boolean,
    default: false
  }
}, { _id: false }) // Pas besoin d'ID pour les sous-documents

const ConversationSchema = new Schema<ConversationDocument>({
  // 🔗 Identifiants
  conversationId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  connectionId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  webhookId: {
    type: String,
    required: true,
    index: true
  },
  
  // 📊 Métadonnées
  platform: {
  type: String,
  enum: ['instagram-dms', 'facebook-messenger', 'sms', 'website-widget', 'webhook'],
  required: true
},
platformDetails: {  // ← AJOUTE CE CHAMP
  type: String,
  required: false
},
  agentId: {
    type: String,
    required: true,
    index: true
  },
  agentName: {
    type: String
  },
  
  // 🆕 NOUVEAUX CHAMPS UTILISATEUR (ajoutés à ton modèle)
  userFirstName: {
    type: String,
    required: false  // Optionnel car ManyChat ne donne pas toujours ces infos
  },
  userLastName: {
    type: String,
    required: false
  },
  userFullName: {
    type: String,
    required: false  // Calculé automatiquement
  },
  userProfilePic: {
    type: String,
    required: false
  },
  userUsername: {
    type: String,
    required: false
  },
  userGender: {
    type: String,
    required: false
  },
  userLocale: {
    type: String,
    required: false
  },
  userTimezone: {
    type: String,
    required: false
  },
  
  // 💬 Messages
  messages: [ConversationMessageSchema],
  
  // 📈 Stats (calculées automatiquement)
  messageCount: {
    type: Number,
    default: 0
  },
  userMessageCount: {
    type: Number,
    default: 0
  },
  assistantMessageCount: {
    type: Number,
    default: 0
  },
  
  // 🕐 Timestamps
  firstMessageAt: {
    type: Date,
    required: true
  },
  lastMessageAt: {
    type: Date,
    required: true
  },
  lastUserMessageAt: {
    type: Date
  },
  lastAssistantMessageAt: {
    type: Date
  },
  
  // 🗑️ Gestion
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  deletedAt: {
    type: Date
  }
}, { 
  timestamps: true
})

// 🔍 Index composites pour performance
ConversationSchema.index({ connectionId: 1, isDeleted: 1, lastMessageAt: -1 }) // Liste conversations
ConversationSchema.index({ conversationId: 1, isDeleted: 1 })                 // Conversation spécifique
ConversationSchema.index({ webhookId: 1, userId: 1, isDeleted: 1 })            // Recherche par user

// 🔧 Middleware pour calculer les stats automatiquement
ConversationSchema.pre('save', function(this: ConversationDocument, next) {
  if (this.isModified('messages')) {
    // Recalculer les stats
    this.messageCount = this.messages.length
    this.userMessageCount = this.messages.filter((m: ConversationMessage) => m.role === 'user').length
    this.assistantMessageCount = this.messages.filter((m: ConversationMessage) => m.role === 'assistant').length
    
    // Mettre à jour les timestamps
    const userMessages = this.messages.filter((m: ConversationMessage) => m.role === 'user')
    const assistantMessages = this.messages.filter((m: ConversationMessage) => m.role === 'assistant')
    
    if (userMessages.length > 0) {
      this.lastUserMessageAt = new Date(Math.max(...userMessages.map((m: ConversationMessage) => m.timestamp)))
    }
    
    if (assistantMessages.length > 0) {
      this.lastAssistantMessageAt = new Date(Math.max(...assistantMessages.map((m: ConversationMessage) => m.timestamp)))
    }
    
    if (this.messages.length > 0) {
      this.firstMessageAt = new Date(Math.min(...this.messages.map((m: ConversationMessage) => m.timestamp)))
      this.lastMessageAt = new Date(Math.max(...this.messages.map((m: ConversationMessage) => m.timestamp)))
    }
  }
  
  // 🆕 CALCULER userFullName automatiquement
  if (this.isModified('userFirstName') || this.isModified('userLastName')) {
    const firstName = this.userFirstName || '';
    const lastName = this.userLastName || '';
    this.userFullName = `${firstName} ${lastName}`.trim() || undefined;
  }
  
  next()
})

// 🔧 Méthodes utiles
ConversationSchema.methods.addMessage = function(message: ConversationMessage) {
  this.messages.push(message)
  return this.save()
}

ConversationSchema.methods.getFilteredMessages = function(this: ConversationDocument, limit: number = 10): ConversationMessage[] {
  // Retourne les derniers messages NON filtrés pour OpenAI
  return this.messages
    .filter((m: ConversationMessage) => !m.isFiltered)  // Exclure les messages de politesse
    .slice(-limit)               // Prendre les X derniers
}

ConversationSchema.methods.softDelete = function(this: ConversationDocument) {
  this.isDeleted = true
  this.deletedAt = new Date()
  return this.save()
}

// 🆕 NOUVELLE MÉTHODE - Mettre à jour les données utilisateur
ConversationSchema.methods.updateUserData = function(this: ConversationDocument, userData: {
  firstName?: string,
  lastName?: string,
  profilePic?: string,
  username?: string,
  gender?: string,
  locale?: string,
  timezone?: string
}) {
  if (userData.firstName) this.userFirstName = userData.firstName;
  if (userData.lastName) this.userLastName = userData.lastName;
  if (userData.profilePic) this.userProfilePic = userData.profilePic;
  if (userData.username) this.userUsername = userData.username;
  if (userData.gender) this.userGender = userData.gender;
  if (userData.locale) this.userLocale = userData.locale;
  if (userData.timezone) this.userTimezone = userData.timezone;
  
  return this.save();
}

export const Conversation = models.Conversation || model<ConversationDocument>('Conversation', ConversationSchema)