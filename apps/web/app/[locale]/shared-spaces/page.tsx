"use client";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { FeatureBanner } from "@/components/feature-banner";
import { HelpTooltip } from "@/components/help-tooltip";

export default function SpacesPage() {
  const t = useTranslations("spaces");
  const locale = useLocale();
  const [spaces, setSpaces] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", owner: "0xowner" });
  async function load() {
    const r = await fetch("/api/spaces");
    const j = await r.json();
    setSpaces(j.spaces || []);
  }
  useEffect(() => { load(); }, []);
  async function create() {
    if (!form.name) return;
    await fetch("/api/spaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    setForm({ ...form, name: "" });
    load();
  }
  return (
    <div>
      <FeatureBanner
        title={t("title")}
        summary="A Shared Space is a namespace where multiple agents collaborate. Members get roles: reader (0), writer (1), or admin (2). Use it for task delegation, multi-step pipelines, or consensus."
        steps={[
          "Create the space (name + owner wallet).",
          "Add members via POST /api/spaces with the 'members' array.",
          "Agents write memories under the shared namespace and read each other's outputs."
        ]}
        guideHref={`/${locale}/help`}
      />

      <div className="bg-paper/60 border border-wood/20 p-6 rounded-sm">
        <div className="text-sm text-wood mb-3 flex items-center">
          {t("create")}
          <HelpTooltip
            title="Role matrix"
            text="reader (0) can search & read; writer (1) can also write memories and artifacts; admin (2) can also add/remove members. Owners are admins by default."
          />
        </div>
        <div className="flex flex-col md:flex-row gap-3">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder={t("namePh")}
            className="flex-1 bg-rice border border-wood/30 rounded px-3 py-2"
          />
          <input
            value={form.owner}
            onChange={(e) => setForm({ ...form, owner: e.target.value })}
            placeholder={t("ownerPh")}
            className="flex-1 bg-rice border border-wood/30 rounded px-3 py-2"
          />
          <button
            onClick={create}
            disabled={!form.name}
            className="px-5 bg-cinnabar text-rice rounded-sm hover:bg-wood disabled:opacity-40"
          >
            {t("create")}
          </button>
        </div>
      </div>

      <ul className="mt-6 grid md:grid-cols-2 gap-4">
        {spaces.map((s) => (
          <li key={s._id} className="bg-rice border-l-4 border-cinnabar p-4 rounded-sm">
            <div className="font-song text-lg">{s.name}</div>
            <div className="text-xs text-wood/70 mt-1 break-all">ns: {s.namespace}</div>
            <div className="text-xs text-wood/70 mt-1">members: {s.members?.length ?? 0}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
