// models/User.ts
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  isSubscribed: { type: Boolean, default: false },
  stripeCustomerId: { type: String },
  subscriptionDate: { type: Date },
  openaiApiKey: { type: String },
  profileImage: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);