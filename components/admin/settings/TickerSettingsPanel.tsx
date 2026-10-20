import React from "react";
import type { EditorialCopy } from "@/lib/settings";

interface TickerSettingsPanelProps {
  copy: EditorialCopy;
  setCopy: React.Dispatch<React.SetStateAction<EditorialCopy>>;
}

export function TickerSettingsPanel({ copy, setCopy }: TickerSettingsPanelProps) {
  return (
    <div className="space-y-6">
      <div className="border-b border-white/[0.08] pb-3">
        <h2 className="text-base font-semibold text-white">Live Wire Ticker Announcement</h2>
        <p className="text-xs text-zinc-400">
          Controls the breaking news notice scrolling continuously across the top of the publication.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
            Ticker Label Badge
          </label>
          <input
            type="text"
            value={copy.ticker.label}
            onChange={(e) =>
              setCopy((prev) => ({
                ...prev,
                ticker: { ...prev.ticker, label: e.target.value },
              }))
            }
            className="w-full max-w-xs rounded-lg border border-white/10 bg-zinc-900/80 px-3.5 py-2 text-xs text-white focus:border-brand-red focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
            Breaking Notice / Live Wire Text
          </label>
          <textarea
            rows={3}
            value={copy.ticker.customNotice}
            onChange={(e) =>
              setCopy((prev) => ({
                ...prev,
                ticker: { ...prev.ticker, customNotice: e.target.value },
              }))
            }
            className="w-full rounded-lg border border-white/10 bg-zinc-900/80 px-3.5 py-2 text-xs text-white focus:border-brand-red focus:outline-none"
          />
        </div>

        {/* Ticker Preview */}
        <div className="rounded-xl border border-white/10 bg-[#0d0e12] p-4 flex items-center gap-3">
          <span className="rounded bg-brand-red px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-white shrink-0">
            {copy.ticker.label}
          </span>
          <span className="text-xs text-zinc-200 truncate">{copy.ticker.customNotice}</span>
        </div>
      </div>
    </div>
  );
}
