import mongoose, { Schema, model, models } from 'mongoose'

const ConnectionSchema = new Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  integrationType: { type: String, required: true },
  aiBuildId: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  settings: { type: Schema.Types.Mixed, default: {} }, // 👈 Ajouté ici
  createdAt: { type: Date, default: Date.now },
})

export const Connection = models.Connection || model('Connection', ConnectionSchema)
