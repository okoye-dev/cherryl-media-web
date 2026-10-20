import React from "react";
import type { EditorialCopy } from "@/lib/settings";

interface NetworkSettingsPanelProps {
  copy: EditorialCopy;
  setCopy: React.Dispatch<React.SetStateAction<EditorialCopy>>;
}

export function NetworkSettingsPanel({ copy, setCopy }: NetworkSettingsPanelProps) {
  return (
    <div className="space-y-6">
      <div className="border-b border-white/[0.08] pb-3">
        <h2 className="text-base font-semibold text-white">Multi-Channel Distribution Network</h2>
        <p className="text-xs text-zinc-400">
          Controls the syndicated readership stats and subscriber copy across channels.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
            Network Headline
          </label>
          <input
            type="text"
            value={copy.network.headline}
            onChange={(e) =>
              setCopy((prev) => ({
                ...prev,
                network: { ...prev.network, headline: e.target.value },
              }))
            }
            className="w-full rounded-lg border border-white/10 bg-zinc-900/80 px-3.5 py-2 text-xs text-white focus:border-brand-red focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
            Network Subheadline
          </label>
          <textarea
            rows={2}
            value={copy.network.subheadline}
            onChange={(e) =>
              setCopy((prev) => ({
                ...prev,
                network: { ...prev.network, subheadline: e.target.value },
              }))
            }
            className="w-full rounded-lg border border-white/10 bg-zinc-900/80 px-3.5 py-2 text-xs text-white focus:border-brand-red focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Subscribers Stat
            </label>
            <input
              type="text"
              value={copy.network.subscribers}
              onChange={(e) =>
                setCopy((prev) => ({
                  ...prev,
                  network: { ...prev.network, subscribers: e.target.value },
                }))
              }
              className="w-full rounded-lg border border-white/10 bg-zinc-900/80 px-3.5 py-2 text-xs text-white focus:border-brand-red focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Monthly Reach Stat
            </label>
            <input
              type="text"
              value={copy.network.reachMonthly}
              onChange={(e) =>
                setCopy((prev) => ({
                  ...prev,
                  network: { ...prev.network, reachMonthly: e.target.value },
                }))
              }
              className="w-full rounded-lg border border-white/10 bg-zinc-900/80 px-3.5 py-2 text-xs text-white focus:border-brand-red focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
