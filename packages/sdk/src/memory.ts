export interface MemoryRecord {
  id: string;
  blobId: string;
  contentHash: string;
  version: number;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface MemorySearchResult {
  id: string;
  score: number;
  blobId: string;
  version: number;
  metadata?: Record<string, any>;
  content: string | null;
  integrityOk: boolean;
  createdAt: string;
}
