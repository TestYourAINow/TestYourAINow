// models/User.ts
import mongoose from "mongoose";

const ApiKeySchema = new mongoose.Schema({
  name: { type: String, required: true }, // "My Main Project", "Client ABC", etc.
  key: { type: String, required: true },
  provider: { type: String, enum: ['openai', 'anthropic'], default: 'openai' },
  createdAt: { type: Date, default: Date.now },
  isDefault: { type: Boolean, default: false }, // Une clé par défaut
});

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  isSubscribed: { type: Boolean, default: false },
  trialUsed: { type: Boolean, default: false },
  stripeCustomerId: { type: String },
  subscriptionDate: { type: Date },
  apiKeys: [ApiKeySchema], // 👈 NOUVEAU : Array d'API keys
  openaiApiKey: { type: String }, // 👈 GARDE pour compatibilité (migration)
  profileImage: { type: String, default: null },
  resetPasswordToken: { type: String },
  resetPasswordExpiry: { type: Date },
  seenAnnouncements: [{ type: String }],
  onboardingSteps: {
    hasCreatedAgent:      { type: Boolean, default: false },
    hasCreatedConnection: { type: Boolean, default: false },
    hasCreatedDemo:       { type: Boolean, default: false },
  },
  onboardingComplete: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);