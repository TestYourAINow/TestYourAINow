  // models\Connection.ts

import mongoose, { Schema, model, models } from 'mongoose'

const ConnectionSchema = new Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  integrationType: { type: String, required: true },
  aiBuildId: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  settings: { type: Schema.Types.Mixed, default: {} },
  
  // 🆕 NOUVEAU CHAMP FOLDER (optionnel pour ne pas casser l'existant)
  folderId: { type: String }, // ID du DeploymentFolder
  
  // Champs webhook existants (optionnels pour ne pas casser l'existant)
  webhookId: { type: String }, // ex: "ST7MI2XLQWAv-NGAjrpIhw"
  webhookSecret: { type: String }, // ex: "abc123secret456"
  webhookUrl: { type: String }, // ex: "https://ton-site.vercel.app/api/webhook/manychat/ST7..."
  
  createdAt: { type: Date, default: Date.now },
})

export const Connection = models.Connection || model('Connection', ConnectionSchema)