"use client";
import { useState } from "react";

type Section = {
  id: string;
  title: string;
  intro?: string;
  steps?: string[];
  notes?: string[];
};

const SECTIONS: Section[] = [
  {
    id: "intro",
    title: "1. What is Nexus Memory?",
    intro:
      "Nexus Memory is a verifiable collaborative memory layer for AI agents. Every memory is encrypted with AES-256-GCM, stored on Walrus decentralized storage, indexed for semantic search, and audited on the Sui blockchain.",
    notes: [
      "Memories are tamper-evident: every read is integrity-verified with SHA-256.",
      "Memories are portable: switch the underlying LLM (OpenAI ↔ Anthropic ↔ Google) without losing context.",
      "Memories are shareable: multiple agents can collaborate in a Shared Space."
    ]
  },
  {
    id: "wallet",
    title: "2. Connect Your Sui Wallet",
    intro:
      "Nexus Memory uses your Sui wallet as your identity. Connect once and all on-chain actions (Agent registration, ACL management, audit events, artifact ownership) are signed by your wallet — never by a server-held key.",
    steps: [
      "In the top-right header, click 'Connect Wallet'.",
      "Pick any Sui-compatible wallet: Sui Wallet, Suiet, Phantom, OKX, Nightly, Backpack…",
      "Approve the connection. Your address and balance appear in the header.",
      "Open the Wallet page (/wallet) to access dedicated on-chain action panels."
    ],
    notes: [
      "Don't have one yet? Install Sui Wallet from suiwallet.com — it works as a Chrome extension and a mobile app.",
      "First-time wallets need testnet SUI. From the Wallet page click 'Faucet' (or run `sui client faucet` in CLI) to get some.",
      "The connected wallet auto-reconnects on next visit. Use 'Disconnect' to forget it."
    ]
  },
  {
    id: "wallet-actions",
    title: "3. Wallet Page — All On-chain Actions",
    intro:
      "The /wallet page exposes every Move call in NexusMemory as a one-click signed transaction. Each action panel has a tip icon explaining exactly what Move function is invoked.",
    steps: [
      "Transfer SUI: send native SUI coins to any address.",
      "Emit Audit Event: anchor any off-chain step on-chain via audit_log::record.",
      "Create Shared Space: create a SharedSpace object whose admin is your wallet.",
      "Add Member to Space: grant a Sui address reader/writer/admin access.",
      "Register Artifact: claim ownership of a Walrus blob as an Artifact object.",
      "Sign Message: produce a cryptographic signature proving wallet control."
    ],
    notes: [
      "Every signed tx returns a digest. Click the digest to view it on Suiscan.",
      "Your owned NexusMemory objects (Agents, MemoryACLs, SharedSpaces, Artifacts) are listed below the action panels.",
      "All actions require gas. If a tx fails with 'insufficient gas', request SUI from the testnet faucet."
    ]
  },
  {
    id: "dashboard",
    title: "4. Dashboard",
    intro:
      "The dashboard shows live KPI cards (Agents, Memory Entries, Shared Spaces, Artifacts) and a Recent Audit panel.",
    steps: [
      "Open Dashboard from the top nav.",
      "Click any KPI card to jump into that module.",
      "Recent Audit shows the last write activities across the system."
    ]
  },
  {
    id: "agents",
    title: "5. Agents — Create & Manage",
    intro:
      "An Agent is an AI persona with its own encrypted memory namespace. Each agent is registered both off-chain (MongoDB) and on-chain (a Sui object).",
    steps: [
      "Open the Agents page.",
      "If your wallet is connected, the 'owner' field auto-fills with your address; otherwise type one manually.",
      "Fill name, model provider and model name. Click Create.",
      "Copy the resulting Agent ID — you'll need it on the Memories page."
    ],
    notes: [
      "If the Sui call fails (no gas), the agent is still created off-chain; onchain id shows as '—'.",
      "Tip: register agents on-chain directly from the /wallet page if you prefer wallet-signed creation."
    ]
  },
  {
    id: "memories",
    title: "6. Memories — Add, Search, Verify",
    intro:
      "Memories are AES-256-GCM-encrypted before Walrus upload and embedded as vectors for semantic search.",
    steps: [
      "Add: paste Agent ID + content, click 'Write to Walrus'.",
      "Search: type a natural-language query, click 'Semantic Search'.",
      "Verify: every result card shows ✓ Integrity Verified when SHA-256 matches."
    ],
    notes: [
      "✗ Verification Failed = the data was tampered with OR the APP_ENCRYPTION_KEY changed.",
      "Lower the threshold (default 0.2) if very short queries return no hits."
    ]
  },
  {
    id: "spaces",
    title: "7. Shared Spaces — Multi-agent Collaboration",
    intro:
      "A Shared Space is a namespace where multiple agents collaborate. Roles: reader (0), writer (1), admin (2).",
    steps: [
      "Open Shared Spaces and create one (off-chain) OR open /wallet and use 'Create Shared Space' for on-chain ownership.",
      "Add members via the wallet page or POST /api/spaces with a 'members' array.",
      "Agents write memories under the shared namespace; others retrieve via semantic search."
    ]
  },
  {
    id: "artifacts",
    title: "8. Artifacts — Files & Reports",
    intro:
      "Artifacts are workflow outputs (datasets, PDFs, JSON, images). Each upload gets a SHA-256 integrity proof; ownership can optionally be anchored on Sui.",
    steps: [
      "Upload via /artifacts to publish a blob to Walrus.",
      "(Optional) Open /wallet → 'Register Artifact' to mint an on-chain ownership object for the blob.",
      "Verify independently: curl the Walrus aggregator, sha256sum, compare with the card."
    ]
  },
  {
    id: "permissions",
    title: "9. Permissions & Audit Log",
    intro: "Every action is logged twice: off-chain MongoDB (fast) and on-chain Sui events (tamper-proof).",
    steps: [
      "Browse the latest 200 events on /permissions.",
      "Filter by actor: GET /api/audit?actor=0x...&limit=500.",
      "Cross-reference the txDigest column with Suiscan to inspect the on-chain proof."
    ]
  },
  {
    id: "settings",
    title: "10. Settings",
    intro: "Switch UI language and view the env vars to configure.",
    steps: [
      "Open Settings.",
      "Pick English / 简体中文 / 繁體中文 — the URL prefix updates automatically.",
      "Server env vars (OPENAI_API_KEY etc.) live in apps/web/.env.local only."
    ]
  },
  {
    id: "sdk",
    title: "11. Using the SDK from Your Code",
    intro:
      "@nexus-memory/sdk wraps every API. Use it directly or plug nexusMemoryMiddleware into Vercel AI SDK.",
    steps: [
      "pnpm add @nexus-memory/sdk",
      "Create a NexusClient with baseUrl.",
      "Call agents.create / memories.add / memories.search / spaces.create / audit.list.",
      "For AI SDK: wrapLanguageModel({ model, middleware: nexusMemoryMiddleware({ client, agentId, topK: 5 }) })."
    ]
  },
  {
    id: "faq",
    title: "12. FAQ — Common Errors",
    intro: "Quick answers for problems you may hit.",
    notes: [
      "Wallet won't connect → ensure your wallet extension is installed and unlocked; refresh the page.",
      "Tx fails 'insufficient gas' → request SUI from the testnet faucet (sui client faucet).",
      "Tx fails E_NOT_OWNER → only the owner can call grant_read / bump_version / add_member.",
      "✗ Verification Failed → APP_ENCRYPTION_KEY changed or data was tampered. Investigate via audit log.",
      "Sui Move publish error 'Could not resolve internal' → see docs/CONTRACTS_TROUBLESHOOTING.md.",
      "Search returns nothing → check OPENAI_API_KEY, the agentId filter, and lower the threshold."
    ]
  }
];

export default function HelpPage() {
  const [active, setActive] = useState<string>("intro");
  const current = SECTIONS.find((s) => s.id === active) ?? SECTIONS[0];

  return (
    <div className="grid md:grid-cols-[260px_1fr] gap-6">
      <aside className="md:sticky md:top-6 md:self-start bg-paper/60 border border-wood/20 rounded-sm p-4">
        <div className="font-song text-lg text-ink mb-3">User Guide</div>
        <nav className="flex flex-col gap-1 text-sm">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={`text-left px-3 py-2 rounded-sm transition ${
                active === s.id
                  ? "bg-cinnabar text-rice"
                  : "text-wood hover:bg-rice"
              }`}
            >
              {s.title}
            </button>
          ))}
        </nav>
        <div className="mt-4 text-xs text-wood/70 border-t border-wood/10 pt-3">
          Full reference: <span className="font-mono">docs/USER_GUIDE.md</span>
        </div>
      </aside>

      <article className="bg-rice border border-wood/20 rounded-sm p-8 ink-in">
        <h1 className="font-song text-3xl text-ink mb-4">{current.title}</h1>
        {current.intro && (
          <p className="text-wood leading-relaxed mb-6">{current.intro}</p>
        )}
        {current.steps && (
          <>
            <h3 className="font-song text-lg text-cinnabar mt-6 mb-2">
              How to do it
            </h3>
            <ol className="list-decimal pl-6 space-y-2 text-ink">
              {current.steps.map((s, i) => (
                <li key={i} className="leading-relaxed">{s}</li>
              ))}
            </ol>
          </>
        )}
        {current.notes && (
          <>
            <h3 className="font-song text-lg text-cinnabar mt-8 mb-2">
              Notes &amp; Tips
            </h3>
            <ul className="space-y-2">
              {current.notes.map((n, i) => (
                <li
                  key={i}
                  className="bg-paper/50 border-l-4 border-cinnabar px-4 py-2 text-sm text-ink"
                >
                  {n}
                </li>
              ))}
            </ul>
          </>
        )}
      </article>
    </div>
  );
}
