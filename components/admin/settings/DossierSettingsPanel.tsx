import React from "react";
import type { EditorialCopy } from "@/lib/settings";

interface DossierSettingsPanelProps {
  copy: EditorialCopy;
  setCopy: React.Dispatch<React.SetStateAction<EditorialCopy>>;
}

export function DossierSettingsPanel({ copy, setCopy }: DossierSettingsPanelProps) {
  return (
    <div className="space-y-6">
      <div className="border-b border-white/[0.08] pb-3">
        <h2 className="text-base font-semibold text-white">Weekend Editorial Dossier</h2>
        <p className="text-xs text-zinc-400">
          Controls the branding, issue badge, and subtitle for the curated cultural section.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
            Issue Badge
          </label>
          <input
            type="text"
            value={copy.dossier.issueBadge}
            onChange={(e) =>
              setCopy((prev) => ({
                ...prev,
                dossier: { ...prev.dossier, issueBadge: e.target.value },
              }))
            }
            className="w-full max-w-md rounded-lg border border-white/10 bg-zinc-900/80 px-3.5 py-2 text-xs text-white focus:border-brand-red focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
            Dossier Main Heading
          </label>
          <input
            type="text"
            value={copy.dossier.heading}
            onChange={(e) =>
              setCopy((prev) => ({
                ...prev,
                dossier: { ...prev.dossier, heading: e.target.value },
              }))
            }
            className="w-full rounded-lg border border-white/10 bg-zinc-900/80 px-3.5 py-2 text-xs text-white focus:border-brand-red focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
            Dossier Subheading / Focus
          </label>
          <textarea
            rows={2}
            value={copy.dossier.subheading}
            onChange={(e) =>
              setCopy((prev) => ({
                ...prev,
                dossier: { ...prev.dossier, subheading: e.target.value },
              }))
            }
            className="w-full rounded-lg border border-white/10 bg-zinc-900/80 px-3.5 py-2 text-xs text-white focus:border-brand-red focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
