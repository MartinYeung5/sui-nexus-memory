# Nexus Memory — User Guide

> A complete walkthrough of every feature in Nexus Memory and how to operate it.
> Sections 1–3 are required reading for first-time users; the rest can be skimmed
> per feature.

---

## Table of Contents

1. [First-time Setup](#1-first-time-setup)
2. [Connect Your Sui Wallet](#2-connect-your-sui-wallet)
3. [Wallet Page — All On-chain Actions](#3-wallet-page)
4. [Dashboard](#4-dashboard)
5. [Agents — Create & Manage](#5-agents)
6. [Memories — Store, Search, Verify](#6-memories)
7. [Shared Spaces — Multi-agent Collaboration](#7-shared-spaces)
8. [Artifacts — Files & Reports](#8-artifacts)
9. [Permissions & Audit Log](#9-permissions--audit-log)
10. [Settings](#10-settings)
11. [Using the SDK from Your Code](#11-using-the-sdk)
12. [FAQ & Common Errors](#12-faq--common-errors)

---

## 1. First-time Setup

Three things must be configured once by an admin:

| What | Where |
|---|---|
| MongoDB running | `docker compose up -d mongo` |
| Sui Move package published | `cd contracts && sui client publish --gas-budget 200000000`. Paste the `PackageID` into both `SUI_PACKAGE_ID` and `NEXT_PUBLIC_SUI_PACKAGE_ID` in `apps/web/.env.local`. |
| `.env.local` filled in | Copy `.env.local.example`, fill all keys |

Then:

```bash
pnpm install
pnpm dev
# Open http://localhost:3000/en
```

---

## 2. Connect Your Sui Wallet

Nexus Memory uses your **Sui wallet** as your identity. All on-chain actions
(Agent registration, MemoryACL management, audit events, artifact ownership)
are signed by **your wallet** — never by a server-held key.

### Supported wallets

Any Sui Wallet Standard wallet works:

- **Sui Wallet** — official, available on Chrome and mobile (suiwallet.com)
- **Suiet**
- **Phantom** (with Sui support enabled)
- **OKX Wallet**
- **Nightly**
- **Backpack**

### Connecting

1. Open any Nexus Memory page.
2. Click **Connect Wallet** in the top-right header.
3. Pick your wallet in the modal and approve.
4. Your address appears in the header (e.g. `0xab12…ef99`) along with the disconnect link.

### Getting testnet SUI

If your wallet is empty, ask the faucet:

```bash
sui client faucet
```

You can also click the Sui Wallet extension's built-in faucet for testnet.

---

## 3. Wallet Page

**Route:** `/{locale}/wallet`

A dedicated console for every on-chain operation. Each panel maps directly to
one Move function in the NexusMemory package.

| Panel | Move call | Use when… |
|---|---|---|
| **Transfer SUI**                | (native coin transfer) | sending gas to a teammate's wallet |
| **Emit Audit Event**            | `audit_log::record(action, target_hash, clock)` | anchoring an off-chain step on-chain |
| **Create Shared Space**         | `shared_space::create(name, namespace)` | creating a collaboration namespace owned by you |
| **Add Member to Space**         | `shared_space::add_member(space, who, role)` | granting reader/writer/admin to another address |
| **Register Artifact**           | `artifact::register(name, blob_id, content_hash)` | claiming on-chain ownership of a Walrus blob |
| **Sign Message**                | `signPersonalMessage` (off-chain) | proving control of an address (login, session) |

Below the panels you'll see:

- **Your On-chain Objects** — every object owned by your wallet (Agents, MemoryACLs, SharedSpaces, Artifacts). Tap any id to copy.
- **Recent Transactions** — last 8 outgoing txs, with Suiscan deep links.

### Anatomy of a wallet action

1. Fill the form in the panel.
2. Click **Sign & Send** — your wallet popup appears.
3. Review the Move call summary in the popup, then approve.
4. The status banner at the top of the page shows `✓ … digest: 0xabcd…`. Click the digest to open Suiscan.

### Failure modes

- *“insufficient gas”* — request SUI from the faucet.
- *`E_NOT_OWNER`* — only the owner of a SharedSpace/MemoryACL can call grant_* / add_member / bump_version.
- Wallet popup doesn't appear — make sure the wallet extension is unlocked, then refresh.

---

## 4. Dashboard

**Route:** `/{locale}/dashboard`

Four KPI cards (Agents, Memories, Spaces, Artifacts), all clickable.
Recent Audit panel shows the last 8 actions.

---

## 5. Agents

**Route:** `/{locale}/agents`

If you have a wallet connected, the **owner** field auto-fills with your
address. Otherwise you can paste any address manually.

Click **Create** to:

1. Allocate a unique namespace.
2. Call `agent_identity::register` on Sui (server-side admin key signs).
3. Write an `agent.create` audit log entry.

After creation, copy the **Agent ID** and reuse it on the Memories page.

> 💡 To sign the registration with **your own wallet** instead of the server's
> admin key, open `/wallet` — but note that the off-chain MongoDB document is
> still created via the Agents page; the two flows complement each other.

---

## 6. Memories

**Route:** `/{locale}/memories`

### Add a memory

1. Paste Agent ID + content.
2. Click **Write to Walrus**.

Behind the scenes:

```
plaintext
  → AES-256-GCM encrypt
  → Walrus PUT (4.5× replicated)
  → OpenAI embedding
  → MongoDB Memory doc + integrity proof
  → Sui audit_log::record event
```

### Search

Type a natural-language query, optionally pin a specific Agent ID, click
**Semantic Search**. Each result card shows:

- similarity %
- ✓ Integrity Verified / ✗ Verification Failed
- decrypted content
- blob id, version

---

## 7. Shared Spaces

**Route:** `/{locale}/shared-spaces`

Create off-chain spaces here, **or** go to `/wallet` → **Create Shared Space**
for a wallet-signed on-chain version. Members can be added via:

- `POST /api/spaces` with a `members` array
- `/wallet` → **Add Member to Space**

---

## 8. Artifacts

**Route:** `/{locale}/artifacts`

Upload any file. Each artifact gets a SHA-256 integrity proof and is persisted
on Walrus. For on-chain **ownership**, also call **Register Artifact** on
`/wallet` with the resulting blob id + sha256.

Verify any artifact independently:

```bash
curl https://aggregator.walrus-testnet.walrus.space/v1/blobs/<BLOB_ID> -o f
sha256sum f      # must match the card's hash
```

---

## 9. Permissions & Audit Log

**Route:** `/{locale}/permissions`

Off-chain (MongoDB) + on-chain (Sui events) dual logging. Cross-reference
`txDigest` rows with [Suiscan](https://suiscan.xyz/testnet) to inspect the
on-chain proof.

---

## 10. Settings

**Route:** `/{locale}/settings`

Language switcher. API keys are server-side only — listed for reference.

---

## 11. Using the SDK

```typescript
import { NexusClient } from "@nexus-memory/sdk";

const client = new NexusClient({ baseUrl: "http://localhost:3000" });

const { agent } = await client.agents.create({
  owner: "0xowner",
  name: "research-bot",
  modelProvider: "openai",
  modelName: "gpt-4o-mini"
});

await client.memories.add({ agentId: agent._id, content: "..." });
const { results } = await client.memories.search({ query: "...", agentId: agent._id, topK: 5 });
```

For automatic memory injection into LLM calls, use
`nexusMemoryMiddleware` with Vercel AI SDK (see `docs/SDK_USAGE.md`).

---

## 12. FAQ & Common Errors

| Symptom | Cause / Fix |
|---|---|
| Wallet doesn't show in modal | extension not installed / not on Sui Wallet Standard |
| Wallet connects but actions fail with "insufficient gas" | `sui client faucet`, or use the in-wallet faucet |
| `E_NOT_OWNER` on grant_read / add_member | only the owner of the ACL/Space can grant rights |
| ✗ Verification Failed | `APP_ENCRYPTION_KEY` changed OR data tampered |
| `sui client publish` fails with `Could not resolve internal` | CLI/framework mismatch — see `docs/CONTRACTS_TROUBLESHOOTING.md` |
| Search returns nothing | check `OPENAI_API_KEY`, agentId filter, lower threshold |
| Migrate provider without losing memory | create new agent under same namespace |

---

## Need more help?

- **Architecture:** `docs/ARCHITECTURE.md`
- **Deployment:** `docs/DEPLOYMENT.md`
- **SDK reference:** `docs/SDK_USAGE.md`
- **Move troubleshooting:** `docs/CONTRACTS_TROUBLESHOOTING.md`
