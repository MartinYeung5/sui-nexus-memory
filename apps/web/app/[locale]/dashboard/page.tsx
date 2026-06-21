"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { FeatureBanner } from "@/components/feature-banner";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const locale = useLocale();

  const [counts, setCounts] = useState({ agents: 0, memories: 0, spaces: 0, artifacts: 0 });
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/agents").then((r) => r.json()),
      fetch("/api/spaces").then((r) => r.json()),
      fetch("/api/artifacts").then((r) => r.json()),
      fetch("/api/audit?limit=10").then((r) => r.json())
    ]).then(([a, s, art, audit]) => {
      setCounts({
        agents: (a.agents || []).length,
        memories: (audit.logs || []).filter((l: any) => l.action === "memory.create").length,
        spaces: (s.spaces || []).length,
        artifacts: (art.artifacts || []).length
      });
      setRecent(audit.logs || []);
    });
  }, []);

  const cards = [
    { label: t("agents"),    value: counts.agents,    hint: t("agentsHint"),    href: "/agents" },
    { label: t("memories"),  value: counts.memories,  hint: t("memoriesHint"),  href: "/memories" },
    { label: t("spaces"),    value: counts.spaces,    hint: t("spacesHint"),    href: "/shared-spaces" },
    { label: t("artifacts"), value: counts.artifacts, hint: t("artifactsHint"), href: "/artifacts" }
  ];

  return (
    <div>
      <FeatureBanner
        title={t("title")}
        summary="An at-a-glance view of your verifiable memory layer. New here? Open the User Guide to walk through every feature step by step."
        steps={[
          "Pick a KPI card to jump into that module.",
          "Read 'Recent Audit' to see the latest write activity.",
          "Open the User Guide for a 10-minute tour."
        ]}
        guideHref={`/${locale}/help`}
      />

      <div className="grid md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={`/${locale}${c.href}`}
            className="bg-paper/70 border border-wood/20 rounded-sm p-5 shadow-sm hover:border-cinnabar transition"
          >
            <div className="text-sm text-wood">{c.label}</div>
            <div className="font-song text-3xl text-cinnabar mt-2">{c.value}</div>
            <div className="text-xs text-wood/70 mt-1">{c.hint}</div>
          </Link>
        ))}
      </div>

      <div className="scroll-divider my-10" />

      <div className="bg-paper/50 border border-wood/20 p-6 rounded-sm">
        <h3 className="font-song text-xl text-ink mb-3">{t("recentAudit")}</h3>
        {recent.length === 0 ? (
          <p className="text-sm text-wood">{t("recentAuditDesc")}</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {recent.slice(0, 8).map((l) => (
              <li key={l._id} className="flex justify-between text-wood">
                <span>
                  <span className="font-mono text-cinnabar">{l.action}</span> by{" "}
                  <span className="font-mono">{l.actor}</span>
                </span>
                <span className="text-xs text-wood/70">
                  {new Date(l.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
