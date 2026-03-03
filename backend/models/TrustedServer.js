import mongoose from "mongoose";

const trustedServerSchema = new mongoose.Schema({
  serverName: {
    type: String,
    required: true,
    unique: true
  },
  serverUrl: {
    type: String,
    required: true
  },
  publicKey: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.model("TrustedServer", trustedServerSchema);
