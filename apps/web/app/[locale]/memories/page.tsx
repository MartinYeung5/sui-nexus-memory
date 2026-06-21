"use client";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { FeatureBanner } from "@/components/feature-banner";
import { HelpTooltip } from "@/components/help-tooltip";
import { safeFetchJson } from "@/lib/safe-fetch";

export default function MemoriesPage() {
  const t = useTranslations("memory");
  const locale = useLocale();
  const [query, setQuery] = useState("");
  const [agentId, setAgentId] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchErr, setSearchErr] = useState<string>("");

  const [createAgentId, setCreateAgentId] = useState("");
  const [content, setContent] = useState("");
  const [writeStatus, setWriteStatus] = useState<string>("");

  async function search() {
    if (!query) return;
    setLoading(true);
    setResults([]);
    setSearchErr("");
    const r = await safeFetchJson("/api/memories/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        agentId: agentId || undefined,
        topK: 8,
        decrypt: true
      })
    });
    if (!r.ok) setSearchErr(r.error || `HTTP ${r.status}`);
    setResults((r.data as any)?.results || []);
    setLoading(false);
  }

  async function addMemory() {
    if (!createAgentId || !content) return;
    setWriteStatus("Encrypting → uploading to Walrus → embedding…");
    const r = await safeFetchJson("/api/memories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentId: createAgentId, content })
    });
    if (!r.ok) {
      setWriteStatus(`✗ ${r.error || `HTTP ${r.status}`}`);
      return;
    }
    const memory = (r.data as any)?.memory;
    if (memory) {
      setWriteStatus(`✓ Stored. blob: ${memory.blobId?.slice(0, 16)}…`);
      setContent("");
    } else {
      setWriteStatus(`✗ unexpected response`);
    }
  }

  return (
    <div>
      <FeatureBanner
        title={t("title")}
        summary="Every memory is encrypted with AES-256-GCM, persisted on Walrus, embedded as a vector, and indexed for semantic search. Each read is integrity-verified by SHA-256."
        steps={[
          "Add: paste Agent ID + content, click Write to Walrus.",
          "Search: type a natural-language query, click Semantic Search.",
          "Verify: every result card shows ✓ Integrity Verified if the SHA-256 matches."
        ]}
        guideHref={`/${locale}/help`}
      />

      {/* Search */}
      <div className="bg-paper/60 border border-wood/20 p-6 rounded-sm">
        <div className="text-sm text-wood mb-3 flex items-center">
          {t("search")}
          <HelpTooltip
            title="How does search work?"
            text="Your query is embedded into a vector, then ranked against memories by cosine similarity. Top-K matching blobs are fetched from Walrus, decrypted, and integrity-checked before being returned."
          />
        </div>
        <div className="flex flex-col md:flex-row gap-3">
          <input
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            placeholder={t("agentIdOpt")}
            className="flex-1 bg-rice border border-wood/30 rounded px-3 py-2"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("placeholder")}
            className="flex-[2] bg-rice border border-wood/30 rounded px-3 py-2"
          />
          <button
            onClick={search}
            disabled={loading || !query}
            className="px-5 py-2 bg-cinnabar text-rice rounded-sm hover:bg-wood transition disabled:opacity-40"
          >
            {loading ? t("searching") : t("search")}
          </button>
        </div>
        {searchErr && (
          <div className="mt-3 text-xs text-red-700 font-mono">✗ {searchErr}</div>
        )}
      </div>

      {/* Write */}
      <div className="bg-paper/40 border border-wood/20 p-6 rounded-sm mt-6">
        <div className="text-sm text-wood mb-3 flex items-center">
          {t("create")}
          <HelpTooltip
            title="Write pipeline"
            text="Plaintext → AES-256-GCM encrypt → Walrus PUT (blobId returned) → OpenAI embedding → MongoDB Memory doc with integrity proof → Sui audit_log::record event."
          />
        </div>
        <div className="flex flex-col md:flex-row gap-3">
          <input
            value={createAgentId}
            onChange={(e) => setCreateAgentId(e.target.value)}
            placeholder={t("agentIdReq")}
            className="flex-1 bg-rice border border-wood/30 rounded px-3 py-2"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t("contentPh")}
            rows={2}
            className="flex-[2] bg-rice border border-wood/30 rounded px-3 py-2"
          />
          <button
            onClick={addMemory}
            disabled={!createAgentId || !content}
            className="px-5 py-2 bg-wood text-rice rounded-sm hover:bg-ink transition disabled:opacity-40"
          >
            {t("writeBtn")}
          </button>
        </div>
        {writeStatus && (
          <div
            className={`mt-3 text-xs font-mono break-all ${
              writeStatus.startsWith("✗") ? "text-red-700" : "text-cinnabar"
            }`}
          >
            {writeStatus}
          </div>
        )}
        {writeStatus.startsWith("✗") &&
          writeStatus.toLowerCase().includes("missing required environment") && (
            <div className="mt-2 text-xs text-wood bg-rice border border-wood/30 rounded-sm p-3">
              💡 Open <code>apps/web/.env.local</code> and fill in:
              <code className="block mt-1">
                MONGODB_URI · APP_ENCRYPTION_KEY · WALRUS_PUBLISHER · WALRUS_AGGREGATOR · OPENAI_API_KEY
              </code>
              Then restart <code>pnpm dev</code>.
            </div>
          )}
      </div>

      {/* Results */}
      <ul className="mt-6 space-y-3">
        {results.map((r) => (
          <li
            key={r.id}
            className="bg-rice border-l-4 border-cinnabar p-4 rounded-sm shadow-sm"
          >
            <div className="flex justify-between text-xs text-wood">
              <span>similarity {(r.score * 100).toFixed(2)}%</span>
              <span className={r.integrityOk ? "text-cinnabar" : "text-red-700"}>
                {r.integrityOk ? `✓ ${t("verifyOk")}` : `✗ ${t("verifyFail")}`}
              </span>
            </div>
            <p className="mt-2 text-ink whitespace-pre-wrap">{r.content}</p>
            <div className="mt-2 text-xs text-wood/70 break-all">
              blob: {r.blobId?.slice(0, 24)}… · v{r.version}
            </div>
          </li>
        ))}
        {!loading && results.length === 0 && query && !searchErr && (
          <li className="text-center text-sm text-wood/70 py-6">
            No matches. Try lowering the threshold or check that this agent has memories.
          </li>
        )}
      </ul>
    </div>
  );
}
