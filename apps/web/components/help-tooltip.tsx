"use client";
import { useState } from "react";

/**
 * Reusable inline help icon. Hover or click to reveal a short explanation.
 * Use this next to any feature title or form field to give users instant guidance.
 *
 *   <h2>Memory Management <HelpTooltip text="Encrypted with AES-256-GCM, stored on Walrus." /></h2>
 */
export function HelpTooltip({ text, title }: { text: string; title?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-block align-middle ml-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="w-5 h-5 rounded-full bg-cinnabar text-rice text-xs font-bold inline-flex items-center justify-center hover:bg-wood transition"
        aria-label="help"
      >
        ?
      </button>
      {open && (
        <span className="absolute z-20 top-7 left-1/2 -translate-x-1/2 w-72 bg-rice border border-wood/30 rounded-sm shadow-lg p-3 text-xs text-ink text-left normal-case font-normal">
          {title && (
            <div className="font-song text-sm text-cinnabar mb-1">{title}</div>
          )}
          <div className="leading-relaxed">{text}</div>
        </span>
      )}
    </span>
  );
}
