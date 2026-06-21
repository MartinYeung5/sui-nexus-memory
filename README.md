# Nexus Memory

**A Verifiable Collaborative Memory Layer for Multi-Agents, Built on Walrus**

Nexus Memory is a multi-agent collaborative memory and orchestration platform
built on top of the Sui blockchain and the Walrus decentralized storage
protocol. It solves the "goldfish dilemma" of modern AI agents — memory that
is ephemeral, isolated, and non-portable.

## 🧠 The Problem

AI agents today face a fundamental bottleneck: **memory is volatile, isolated, and fragmented**. Tasks completed, context accumulated, and decisions made during one session vanish as soon as the session ends. Developers are left stitching together vector stores, traditional databases, and runtime state—a patchwork that buckles under the weight of long-running workflows or multi-agent coordination.

> *"The major misconception in AI is that compute is the only bottleneck. The major issue is we want our LLMs to actually learn about us."* **— Kostas Chalkias, Co-Founder & Chief Cryptographer, Mysten Labs**

Even when memory exists, it is **locked into a single platform or model provider**. If a task starts in OpenAI and needs to be handed off to a Claude-based agent, the context doesn't move with it. This makes agent systems **brittle, hard to scale, and difficult to trust**.

**Nexus Memory** solves this by giving AI agents a **portable, verifiable, and persistent memory layer** built on Walrus—a decentralized storage protocol designed for high performance and verifiability.

---

## 💡 The Solution

**Nexus Memory** is a **multi-agent collaborative memory and orchestration platform** built on [Walrus Memory (MemWal)](https://memwal.ai)—the first memory layer built specifically for AI agents that is portable, verifiable, and fully under builders' control.

Instead of memory being an internal variable in a script, it becomes a **decentralized asset** owned by the developer or user. Agents can:

- **Remember** across sessions, apps, and workflows
- **Share** memory with other agents via shared memory spaces
- **Verify** the integrity of data before acting on it
- **Move** freely across different LLM providers without losing context

Walrus Memory is natively integrated with **Claude, ChatGPT, and Gemini**, with plugins for **OpenClaw and NemoClaw**, as well as **Python and TypeScript SDKs**.

---

## 🚀 Core Features

### 🔐 Persistent, Encrypted Agent Memory

Each agent gets its own encrypted memory space stored on Walrus's decentralized storage network. Memories are retrieved via **semantic search**—agents intelligently query their memory to pull relevant context. Data is encrypted by default with programmable access permissions.

### 👥 Shared Memory Spaces & Multi-Agent Coordination

Multiple agents can access common contexts to coordinate in long-running workflows:
- **Task delegation** — context transfers seamlessly between agents
- **Step-by-step execution** — agents share intermediate states and results
- **Negotiation & consensus** — agents exchange information within shared spaces

### 📦 Artifact-Driven Workflow Engine

Agents generate artifacts (datasets, logs, reports, intermediate outputs) that are automatically stored on Walrus and become inputs for subsequent agents. Each artifact comes with a **verifiable integrity proof**.

**Typical flow:**
1. Data agent scrapes market data → stores as blob on Walrus
2. Analysis agent reads dataset → generates report → stores as new blob
3. Decision agent acts on report → all steps form an auditable chain

### 🔄 Cross-Model & Cross-Platform Portability

Memory is not bound to any single model or provider. Users can freely switch between OpenAI, Anthropic, Google, and other models while the agent's memory and context remain fully intact.

### 🛠️ Developer-Friendly Tooling

- **Python & TypeScript SDKs** — add persistent memory in minutes
- **Native MCP (Model Context Protocol) support** — any MCP-compatible agent can plug in
- **OpenClaw & NemoClaw plugins** — seamless integration with agent orchestration frameworks
- **Vercel AI SDK integration** — works as middleware with `streamText`, `generateText`, and more
- **CLI tools** — inspect, debug, and manage agent memory

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Application Layer                          │
│   Research Agent │ Customer Agent │ DeFi Agent │ Knowledge Agent│
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                  Nexus Memory Orchestration                    │
│  • Shared Memory Spaces  • Artifact Lifecycle                  │
│  • Agent Coordination     • Access Control Policies            │
│  • Memory Versioning      • Audit Trail                        │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│               Walrus Memory (MemWal) SDK Layer                 │
│  • Encrypted Storage/Retrieval  • Semantic Search              │
│  • MCP-Compatible Interface     • Python/TypeScript SDKs       │
│  • OpenClaw/NemoClaw Plugins                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                   Walrus Decentralized Storage                 │
│  • Red Stuff Erasure Coding (4.5× replication)                 │
│  • Blob Storage  • Sui Blockchain (Ownership + Access)         │
│  • Verifiability Guarantees                                    │
└─────────────────────────────────────────────────────────────────┘
```

Walrus uses a "blob" storage approach where actual data is stored across a network of storage nodes, while metadata and ownership logic live on the Sui blockchain. This separation allows the network to scale to petabytes while keeping access speeds high. With mainnet live since March 2025 and over 4PB of data stored, Walrus has proven its production readiness.

---

## 🔍 Why Walrus Memory?

Walrus Memory targets four core areas that affect LLM memory quality: **storage, retrieval, ranking, and encryption**. Early testing shows as much as **60% improvement** on some metrics through better ranking, filtering, and encrypted data handling.

| Feature | Benefit |
|---------|---------|
| **Verifiability** | Agents verify memory integrity before acting—critical for DeFi and sensitive operations |
| **Portability** | Memory moves across agents, workflows, and LLM providers |
| **Availability** | Memory persists even if a service provider goes down |
| **Programmable Access** | Fine-grained policies determine which agents read/write which memories |
| **Cryptographic Verification** | zk-proofs enable contextual verification and access policy enforcement |

> *"I don't believe any other blockchain-focused solution is solving all of these three elements—privacy, policy-sharing across models, and smart data handling."* **— Kostas Chalkias**

---

## 💼 Use Cases

### 📊 Intelligent Research & Trading Agents

A team of agents forms an investment research squad—data agents pull on-chain data and market sentiment, analysis agents generate reports, trading agents execute strategies based on accumulated insights. All memories and artifacts form an auditable, verifiable decision chain.

**Example:** [Talus Network](https://talus.network) uses Walrus for on-chain AI agents, with Sui handling workflow coordination and Walrus managing the data layer (training sets, context, memory, model files).

### 🗣️ Cross-Session Smart Customer Service

Customer service agents remember every customer's preferences, historical interactions, and resolution records—even across months or team handovers. Agents from different teams collaborate using the same customer history.

**Example:** [Allium](https://allium.so) is building AI assistants that remember customer interactions across sessions using Walrus Memory.

### 🔬 Decentralized Scientific Research

Research agents share experimental data, literature notes, and intermediate results across distributed projects. Every data point can be verified for provenance and integrity, helping tackle the reproducibility crisis.

### 📋 Enterprise Knowledge & Audit Compliance

Multiple AI agents within an enterprise share a unified memory layer. All decisions and actions generate a complete audit trail—critical in regulated industries where a single corrupted data point can cause significant loss.

---

## 📦 SDKs & Integrations

| Integration | Description |
|-------------|-------------|
| [**@mysten-incubation/memwal**](https://www.npmjs.com/package/@mysten-incubation/memwal) | Core TypeScript SDK—store encrypted memories with semantic search |
| [**walrus-verity**](https://pypi.org/project/walrus-verity/) | Python proof-chain registry—structured, portable memory for agents |
| [**@mysten-incubation/oc-memwal**](https://www.npmjs.com/package/@mysten-incubation/oc-memwal) | OpenClaw/NemoClaw plugin—persistent cross-session memory |
| [**@memwalpp/mcp**](https://www.npmjs.com/package/@memwalpp/mcp) | MCP-compatible interface—any MCP agent can use MemWal |
| [**@mysten-incubation/memwal/ai**](https://www.npmjs.com/package/@mysten-incubation/memwal) | Vercel AI SDK integration—works with `streamText`, `generateText` |

Walrus Memory also natively integrates with **Claude, ChatGPT, and Gemini**.

---

## 🌐 Ecosystem

Nexus Memory is part of a growing ecosystem of builders leveraging Walrus Memory:

| Partner | Use Case |
|---------|----------|
| **Talus Labs** | On-chain autonomous AI agents with persistent memory |
| **Allium** | AI assistants that remember customer interactions across sessions |
| **Tatum** | Monitoring agents with audit trails and persistent observations |
| **Conso Labs** | Portable agent identity systems |
| **Inflectiv** | Agent memory and coordination infrastructure |
| **OpenGradient** | Verifiable AI computation and memory |

Walrus has over 4PB of data stored on mainnet since March 2025, with cross-chain expansions to Ethereum and Solana on the 2026 roadmap.

---


## 📚 Documentation Index

| Document | Purpose |
|---|---|
| **[docs/USER_GUIDE.md](docs/USER_GUIDE.md)**             | Step-by-step tutorial for every UI feature (wallet included) |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)              | Layered architecture & data flow |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)                  | Local & production deployment |
| [docs/SDK_USAGE.md](docs/SDK_USAGE.md)                    | TypeScript SDK + Vercel AI middleware |
| [docs/CONTRACTS_TROUBLESHOOTING.md](docs/CONTRACTS_TROUBLESHOOTING.md) | Fix Sui Move publish errors |

## 📂 Project Layout

```
nexus-memory/
├── apps/web/            # Next.js 14 main app  (package: @nexus-memory/web)
├── packages/sdk/        # @nexus-memory/sdk
├── packages/shared/     # @nexus-memory/shared
├── contracts/           # Sui Move smart contracts
├── docs/                # Full documentation
└── docker-compose.yml
```

## 🚀 Quick Start

```bash
# 1. Install deps
pnpm install

# 2. Start MongoDB
docker compose up -d mongo

# 3. Configure env
cp apps/web/.env.local.example apps/web/.env.local
# Fill MongoDB / Sui / Walrus / OpenAI keys

# 4. Publish Sui contracts
cd contracts && sui client publish --gas-budget 200000000
# Paste the printed PackageID into BOTH:
#   SUI_PACKAGE_ID             (server)
#   NEXT_PUBLIC_SUI_PACKAGE_ID (browser, needed for wallet flows)

# 5. Launch web (any of these works)
pnpm dev                                  # convenience alias at repo root
pnpm web                                  # same thing
pnpm --filter @nexus-memory/web dev       # scoped filter
pnpm -C apps/web dev                      # direct path
# → http://localhost:3000/en
```


## 💼 Wallet-first Flow

1. Visit `/en` → click **Connect Wallet** in the header.
2. Approve in Sui Wallet / Suiet / Phantom / etc.
3. Go to `/en/wallet` to access every on-chain action panel.

Need testnet SUI? Run `sui client faucet` or use your wallet's built-in faucet.

## 🩹 Troubleshooting

| Symptom | Fix |
|---|---|
| `No projects matched the filters` after `pnpm --filter web dev` | Use `pnpm dev` (root) or `pnpm --filter @nexus-memory/web dev` |
| Wallet won't connect | Ensure extension is installed & unlocked, refresh page |
| Sui publish: `Could not resolve internal` | See `docs/CONTRACTS_TROUBLESHOOTING.md` |
| Memory shows ✗ Verification Failed | `APP_ENCRYPTION_KEY` changed; see `docs/USER_GUIDE.md` §12 |

## 🙏 Acknowledgements

- [Walrus Protocol](https://walrus.xyz) — Verifiable Data Platform for AI and onchain finance
- [Mysten Labs](https://mystenlabs.com) — Original contributors to Walrus
- [Sui Blockchain](https://sui.io) — Foundation for Walrus's ownership and access control

## 📄 License

MIT

