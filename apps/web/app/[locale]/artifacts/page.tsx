"use client";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { FeatureBanner } from "@/components/feature-banner";
import { HelpTooltip } from "@/components/help-tooltip";

export default function ArtifactsPage() {
  const t = useTranslations("artifacts");
  const locale = useLocale();
  const [items, setItems] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [agentId, setAgentId] = useState("");
  const [status, setStatus] = useState("");

  async function load() {
    const r = await fetch("/api/artifacts");
    const j = await r.json();
    setItems(j.artifacts || []);
  }
  useEffect(() => { load(); }, []);

  async function upload() {
    if (!file) return;
    setStatus("Uploading to Walrus…");
    const fd = new FormData();
    fd.append("file", file);
    if (agentId) fd.append("agentId", agentId);
    const r = await fetch("/api/artifacts", { method: "POST", body: fd });
    const j = await r.json();
    if (j.artifact) {
      setStatus(`✓ Stored. blob: ${j.artifact.blobId?.slice(0, 16)}…`);
      setFile(null);
    } else {
      setStatus(`✗ ${j.error || "failed"}`);
    }
    load();
  }

  return (
    <div>
      <FeatureBanner
        title={t("title")}
        summary="Artifacts are workflow outputs (datasets, PDFs, JSON, images). Each upload gets a SHA-256 integrity proof and is persisted on Walrus with 4.5× replication."
        steps={[
          "(Optional) paste an Agent ID to attribute the upload.",
          "Pick a file and click Upload to Walrus.",
          "Verify independently: curl the aggregator with the blob id, sha256sum it, compare with the card."
        ]}
        guideHref={`/${locale}/help`}
      />

      <div className="bg-paper/60 border border-wood/20 p-6 rounded-sm">
        <div className="text-sm text-wood mb-3 flex items-center">
          {t("upload")}
          <HelpTooltip
            title="Encryption?"
            text="Unlike memories, artifacts are NOT encrypted by default — they are usually meant to be shared between agents. They still get a SHA-256 integrity proof so tampering is detectable."
          />
        </div>
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          <input
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            placeholder={t("agentPh")}
            className="flex-1 bg-rice border border-wood/30 rounded px-3 py-2"
          />
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="text-sm text-wood"
          />
          <button
            onClick={upload}
            disabled={!file}
            className="px-5 py-2 bg-cinnabar text-rice rounded-sm hover:bg-wood disabled:opacity-40"
          >
            {t("upload")}
          </button>
        </div>
        {status && <div className="mt-3 text-xs text-cinnabar font-mono">{status}</div>}
      </div>

      <ul className="mt-6 grid md:grid-cols-2 gap-4">
        {items.map((a) => (
          <li key={a._id} className="bg-rice border-l-4 border-cinnabar p-4 rounded-sm">
            <div className="flex justify-between">
              <span className="font-song">{a.name}</span>
              <span className="text-xs text-wood">{(a.size / 1024).toFixed(1)} KB</span>
            </div>
            <div className="text-xs text-wood/70 mt-1 break-all">
              blob: {a.blobId?.slice(0, 26)}…
            </div>
            <div className="text-xs text-wood/70 break-all">
              sha256: {a.contentHash?.slice(0, 26)}…
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
