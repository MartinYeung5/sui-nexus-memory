# Nexus Memory — Architecture

## Layered View

```
┌─────────────────────────────────────────────────────────────┐
│  Application Layer (UI)                                     │
│  Research / Customer-Service / Scientific / Enterprise      │
│  Agents                                                     │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│  Nexus Memory Orchestration Layer                           │
│  Shared Spaces · Artifact Lifecycle · Coordination Engine   │
│  Access Policy · Versioning · Audit · Semantic Search       │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│  MemWal / Walrus Memory SDK Layer                           │
│  Encrypted store/retrieve · Semantic search · MCP iface     │
│  TypeScript SDK · Vercel AI middleware                      │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│  Walrus Decentralized Storage Layer                         │
│  RedStuff erasure coding · Blob storage · 4.5× replication  │
│  Sui Blockchain (ownership + ACL) · Verifiability           │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Memory Write

1. Agent → `POST /api/memories`
2. Backend encrypts plaintext with AES-256-GCM
3. Encrypted blob is uploaded to Walrus via `walrusPut()`
4. Plaintext is embedded into a vector via OpenAI embeddings
5. A MongoDB `Memory` document stores metadata (blobId, hash, embedding, version)
6. An on-chain audit event is emitted via `audit_log::record`

### Memory Search

1. Agent → `POST /api/memories/search`
2. Query text is embedded into a vector
3. Cosine similarity is computed against candidate memories in MongoDB
4. Top-K matching blobs are fetched from Walrus
5. Each blob is decrypted, SHA-256 is checked against `contentHash`
6. Verified plaintext is returned to the caller along with similarity scores

### Artifact Lifecycle

1. Agent → multipart `POST /api/artifacts`
2. The raw file is uploaded to Walrus via `walrusPut()`
3. A MongoDB `Artifact` document records blobId + integrity proof
4. Optionally a Sui `artifact::register` Move call records ownership on-chain

## Security Model

- All memory blobs are encrypted with AES-256-GCM before leaving the backend.
- The encryption key never leaves the server environment.
- An integrity proof = SHA-256 of the plaintext + Walrus certification epochs.
- ACLs are enforced by `memory_acl::MemoryACL` and `shared_space::SharedSpace`.
- Audit trails are emitted on-chain via `audit_log::record` events.
