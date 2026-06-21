"use client";
import Link from "next/link";

/**
 * Top-of-page contextual banner that summarizes a feature in one glance:
 * - what it is
 * - the typical 3-step recipe
 * - a link to the full guide
 */
export function FeatureBanner({
  title,
  summary,
  steps,
  guideHref
}: {
  title: string;
  summary: string;
  steps: string[];
  guideHref: string;
}) {
  return (
    <section className="bg-paper/60 border border-wood/20 rounded-sm p-5 mb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="font-song text-2xl text-ink">{title}</div>
          <p className="text-sm text-wood mt-1">{summary}</p>
        </div>
        <Link
          href={guideHref}
          className="text-xs px-3 py-1 border border-cinnabar text-cinnabar rounded-sm hover:bg-cinnabar hover:text-rice transition shrink-0"
        >
          Full Guide →
        </Link>
      </div>
      <ol className="mt-4 grid md:grid-cols-3 gap-3 text-sm">
        {steps.map((s, i) => (
          <li
            key={i}
            className="bg-rice border-l-4 border-cinnabar px-3 py-2 rounded-sm"
          >
            <span className="font-song text-cinnabar mr-2">{i + 1}.</span>
            <span className="text-ink">{s}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
