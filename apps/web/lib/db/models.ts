import { Schema, model, models, Types } from "mongoose";

const UserSchema = new Schema({
  walletAddress: { type: String, unique: true, index: true, required: true },
  email: String,
  displayName: String,
  locale: { type: String, enum: ["zh-CN", "zh-TW", "en"], default: "zh-CN" },
  createdAt: { type: Date, default: Date.now }
});

const AgentSchema = new Schema({
  owner: { type: String, index: true, required: true },
  onchainId: { type: String, index: true },
  name: { type: String, required: true },
  description: String,
  modelProvider: { type: String, enum: ["openai", "anthropic", "google", "custom"] },
  modelName: String,
  namespace: { type: String, index: true, required: true },
  status: { type: String, enum: ["active", "paused", "archived"], default: "active" },
  createdAt: { type: Date, default: Date.now }
});

const MemorySchema = new Schema({
  agentId: { type: Types.ObjectId, ref: "Agent", index: true, required: true },
  namespace: { type: String, index: true, required: true },
  blobId: { type: String, required: true },
  contentHash: { type: String, required: true },
  encryptedNonce: String,
  vectorRef: String,
  embedding: { type: [Number], index: false },
  metadata: Schema.Types.Mixed,
  version: { type: Number, default: 1 },
  parentVersionId: { type: Types.ObjectId, ref: "Memory" },
  integrityProof: String,
  createdAt: { type: Date, default: Date.now }
});
MemorySchema.index({ namespace: 1, createdAt: -1 });

const SharedSpaceSchema = new Schema({
  name: { type: String, required: true },
  owner: { type: String, required: true },
  onchainId: String,
  members: [
    {
      agentId: { type: Types.ObjectId, ref: "Agent" },
      role: { type: String, enum: ["reader", "writer", "admin"] }
    }
  ],
  namespace: { type: String, unique: true, required: true },
  createdAt: { type: Date, default: Date.now }
});

const ArtifactSchema = new Schema({
  spaceId: { type: Types.ObjectId, ref: "SharedSpace", index: true },
  agentId: { type: Types.ObjectId, ref: "Agent", index: true },
  name: String,
  mimeType: String,
  size: Number,
  blobId: { type: String, required: true },
  contentHash: { type: String, required: true },
  integrityProof: String,
  version: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

const AuditLogSchema = new Schema({
  actor: { type: String, index: true },
  agentId: { type: Types.ObjectId, ref: "Agent" },
  action: { type: String, index: true },
  target: String,
  txDigest: String,
  metadata: Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now, index: true }
});

export const User        = models.User        || model("User", UserSchema);
export const Agent       = models.Agent       || model("Agent", AgentSchema);
export const Memory      = models.Memory      || model("Memory", MemorySchema);
export const SharedSpace = models.SharedSpace || model("SharedSpace", SharedSpaceSchema);
export const Artifact    = models.Artifact    || model("Artifact", ArtifactSchema);
export const AuditLog    = models.AuditLog    || model("AuditLog", AuditLogSchema);
