"use client";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { FeatureBanner } from "@/components/feature-banner";
import { HelpTooltip } from "@/components/help-tooltip";
import { safeFetchJson } from "@/lib/safe-fetch";

export default function AgentsPage() {
  const t = useTranslations("agent");
  const locale = useLocale();
  const account = useCurrentAccount();
  const [agents, setAgents] = useState<any[]>([]);
  const [form, setForm] = useState({
    owner: "",
    name: "",
    description: "",
    modelProvider: "openai",
    modelName: "gpt-4o-mini"
  });
  const [lastCreated, setLastCreated] = useState<any | null>(null);
  const [err, setErr] = useState<string>("");

  async function load() {
    const r = await safeFetchJson<{ agents: any[] }>("/api/agents");
    setAgents(r.data?.agents || []);
  }
  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (account?.address && !form.owner) {
      setForm((f) => ({ ...f, owner: account.address }));
    }
  }, [account?.address]);

  async function create() {
    setErr("");
    const r = await safeFetchJson<{ agent: any }>("/api/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    if (!r.ok) {
      setErr(r.error || `HTTP ${r.status}`);
      return;
    }
    if (r.data?.agent) setLastCreated(r.data.agent);
    setForm({ ...form, name: "" });
    load();
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text).catch(() => {});
  }

  return (
    <div>
      <FeatureBanner
        title={t("workbench")}
        summary="An Agent is an AI persona with its own encrypted memory namespace. Registered both off-chain (MongoDB) and on-chain (Sui object). Connect your wallet to sign the registration yourself."
        steps={[
          "Connect your Sui wallet in the top header (the owner field will auto-fill).",
          "Fill name, provider and model — click Create.",
          "Copy the Agent ID and reuse it on the Memories page."
        ]}
        guideHref={`/${locale}/help`}
      />

      <div className="bg-paper/60 border border-wood/20 p-6 rounded-sm">
        <div className="font-song text-lg text-ink mb-3 flex items-center">
          {t("create")}
          <HelpTooltip
            title="What happens on Create?"
            text="A unique namespace is allocated, agent_identity::register is called on Sui, and an agent.create audit log entry is written."
          />
        </div>
        <div className="grid md:grid-cols-5 gap-3">
          <input
            value={form.owner}
            onChange={(e) => setForm({ ...form, owner: e.target.value })}
            placeholder={account ? "auto-filled from wallet" : t("ownerPh")}
            className="bg-rice border border-wood/30 rounded px-3 py-2"
          />
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder={t("namePh")}
            className="bg-rice border border-wood/30 rounded px-3 py-2"
          />
          <select
            value={form.modelProvider}
            onChange={(e) => setForm({ ...form, modelProvider: e.target.value })}
            className="bg-rice border border-wood/30 rounded px-3 py-2"
          >
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
            <option value="google">Google</option>
            <option value="custom">Custom</option>
          </select>
          <input
            value={form.modelName}
            onChange={(e) => setForm({ ...form, modelName: e.target.value })}
            placeholder={t("modelPh")}
            className="bg-rice border border-wood/30 rounded px-3 py-2"
          />
          <button
            onClick={create}
            disabled={!form.name || !form.owner}
            className="bg-cinnabar text-rice rounded-sm hover:bg-wood transition disabled:opacity-40"
          >
            {t("create")}
          </button>
        </div>

        {err && (
          <div className="mt-3 text-xs text-red-700 font-mono break-all">✗ {err}</div>
        )}

        {lastCreated && (
          <div className="mt-4 bg-rice border-l-4 border-cinnabar p-3 rounded-sm text-sm">
            <div className="text-wood mb-1">✓ Agent created. Copy this ID into the Memories page:</div>
            <div className="flex items-center gap-2">
              <code className="font-mono text-ink break-all">{lastCreated._id}</code>
              <button
                onClick={() => copy(lastCreated._id)}
                className="text-xs px-2 py-1 bg-wood text-rice rounded-sm hover:bg-ink"
              >
                Copy
              </button>
            </div>
          </div>
        )}
      </div>

      <h3 className="font-song text-xl text-ink mt-8 mb-3 flex items-center">
        {t("list")}
        <HelpTooltip text="All agents you've created. Each card shows MongoDB id + Sui object id (or '—' if Sui call was skipped)." />
      </h3>
      <ul className="grid md:grid-cols-2 gap-4">
        {agents.map((a) => (
          <li
            key={a._id}
            className="bg-rice border-l-4 border-cinnabar p-4 rounded-sm shadow-sm"
          >
            <div className="flex justify-between">
              <div className="font-song text-lg">{a.name}</div>
              <span className="text-xs text-wood">
                {a.modelProvider}/{a.modelName}
              </span>
            </div>
            <div className="text-xs text-wood/70 mt-2 break-all">
              ns: {a.namespace} · onchain: {a.onchainId || "—"}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <code className="text-xs font-mono text-ink break-all">{a._id}</code>
              <button
                onClick={() => copy(a._id)}
                className="text-xs px-2 py-0.5 bg-wood text-rice rounded-sm hover:bg-ink shrink-0"
              >
                Copy ID
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
