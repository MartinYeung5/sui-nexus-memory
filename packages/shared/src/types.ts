export type Locale = "zh-CN" | "zh-TW" | "en";
export type ModelProvider = "openai" | "anthropic" | "google" | "custom";
export type SpaceRole = "reader" | "writer" | "admin";

export interface Agent {
  _id: string;
  owner: string;
  onchainId?: string;
  name: string;
  description?: string;
  modelProvider: ModelProvider;
  modelName: string;
  namespace: string;
  status: "active" | "paused" | "archived";
  createdAt: string;
}

export interface Memory {
  _id: string;
  agentId: string;
  namespace: string;
  blobId: string;
  contentHash: string;
  integrityProof?: string;
  version: number;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface SharedSpace {
  _id: string;
  name: string;
  owner: string;
  namespace: string;
  members: { agentId: string; role: SpaceRole }[];
  createdAt: string;
}

export interface Artifact {
  _id: string;
  spaceId?: string;
  agentId?: string;
  name: string;
  mimeType: string;
  size: number;
  blobId: string;
  contentHash: string;
  version: number;
  createdAt: string;
}

export interface AuditLog {
  _id: string;
  actor: string;
  action: string;
  target: string;
  txDigest?: string;
  createdAt: string;
}
