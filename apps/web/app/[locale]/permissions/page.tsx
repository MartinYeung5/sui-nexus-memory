"use client";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { FeatureBanner } from "@/components/feature-banner";
import { HelpTooltip } from "@/components/help-tooltip";

export default function PermissionsPage() {
  const t = useTranslations("permissions");
  const locale = useLocale();
  const [logs, setLogs] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/audit").then((r) => r.json()).then((j) => setLogs(j.logs || []));
  }, []);
  return (
    <div>
      <FeatureBanner
        title={t("title")}
        summary="Every action is logged twice: off-chain in MongoDB (fast queries) and on-chain as a Sui event (tamper-proof). Use this page for compliance, debugging, and audit trails."
        steps={[
          "Browse the latest 200 events below.",
          "Filter programmatically: GET /api/audit?actor=0x...&limit=500",
          "Cross-reference txDigest with Sui Explorer to see the on-chain proof."
        ]}
        guideHref={`/${locale}/help`}
      />

      <div className="bg-paper/60 border border-wood/20 p-6 rounded-sm flex items-center">
        <div className="text-sm text-wood">{t("desc")}</div>
        <HelpTooltip
          title="What's recorded?"
          text="agent.create, memory.create, artifact.create and similar actions, with actor wallet, target id, timestamp, and (when available) the Sui transaction digest."
        />
      </div>

      <ul className="mt-6 space-y-2">
        {logs.map((l) => (
          <li
            key={l._id}
            className="bg-rice border-l-4 border-cinnabar px-4 py-2 text-sm rounded-sm flex justify-between"
          >
            <div>
              <span className="font-mono text-cinnabar">{l.action}</span>{" "}
              <span className="text-wood">by {l.actor}</span>{" "}
              <span className="text-wood/70 break-all">→ {l.target}</span>
            </div>
            <div className="text-xs text-wood/70">
              {new Date(l.createdAt).toLocaleString()}
            </div>
          </li>
        ))}
        {logs.length === 0 && (
          <li className="text-center text-sm text-wood/70 py-6">
            No audit events yet. Create an agent or write a memory to populate the log.
          </li>
        )}
      </ul>
    </div>
  );
}
