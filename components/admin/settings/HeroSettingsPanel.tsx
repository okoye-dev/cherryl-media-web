import React from "react";
import type { EditorialCopy } from "@/lib/settings";

interface HeroSettingsPanelProps {
  copy: EditorialCopy;
  setCopy: React.Dispatch<React.SetStateAction<EditorialCopy>>;
}

export function HeroSettingsPanel({ copy, setCopy }: HeroSettingsPanelProps) {
  return (
    <div className="space-y-6">
      <div className="border-b border-white/[0.08] pb-3">
        <h2 className="text-base font-semibold text-white">Homepage Hero &amp; Masthead Title</h2>
        <p className="text-xs text-zinc-400">
          Controls the primary title and description visible when readers land on Cherryl Media.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
            Edition Badge
          </label>
          <input
            type="text"
            value={copy.hero.editionBadge}
            onChange={(e) =>
              setCopy((prev) => ({
                ...prev,
                hero: { ...prev.hero, editionBadge: e.target.value },
              }))
            }
            className="w-full rounded-lg border border-white/10 bg-zinc-900/80 px-3.5 py-2 text-xs text-white focus:border-brand-red focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Title Lead
            </label>
            <input
              type="text"
              value={copy.hero.titleLead}
              onChange={(e) =>
                setCopy((prev) => ({
                  ...prev,
                  hero: { ...prev.hero, titleLead: e.target.value },
                }))
              }
              className="w-full rounded-lg border border-white/10 bg-zinc-900/80 px-3.5 py-2 text-xs text-white focus:border-brand-red focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Title Accent (Italic Crimson)
            </label>
            <input
              type="text"
              value={copy.hero.titleAccent}
              onChange={(e) =>
                setCopy((prev) => ({
                  ...prev,
                  hero: { ...prev.hero, titleAccent: e.target.value },
                }))
              }
              className="w-full rounded-lg border border-brand-red/30 bg-zinc-900/80 px-3.5 py-2 text-xs text-white focus:border-brand-red focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Title Trail
            </label>
            <input
              type="text"
              value={copy.hero.titleTrail}
              onChange={(e) =>
                setCopy((prev) => ({
                  ...prev,
                  hero: { ...prev.hero, titleTrail: e.target.value },
                }))
              }
              className="w-full rounded-lg border border-white/10 bg-zinc-900/80 px-3.5 py-2 text-xs text-white focus:border-brand-red focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
            Editorial Description
          </label>
          <textarea
            rows={3}
            value={copy.hero.description}
            onChange={(e) =>
              setCopy((prev) => ({
                ...prev,
                hero: { ...prev.hero, description: e.target.value },
              }))
            }
            className="w-full rounded-lg border border-white/10 bg-zinc-900/80 px-3.5 py-2 text-xs text-white focus:border-brand-red focus:outline-none"
          />
        </div>

        {/* Live Preview */}
        <div className="rounded-xl border border-white/10 bg-[#0d0e12] p-4 space-y-2">
          <span className="label text-[0.62rem] text-zinc-400 uppercase tracking-wider">Hero Preview</span>
          <p className="label-red text-xs font-semibold text-brand-red">{copy.hero.editionBadge}</p>
          <h3 className="text-xl font-bold text-white">
            <span>{copy.hero.titleLead}</span>
            <span className="italic font-serif text-brand-red">{copy.hero.titleAccent}</span>
            <span>{copy.hero.titleTrail}</span>
          </h3>
          <p className="text-xs text-zinc-400 max-w-xl">{copy.hero.description}</p>
        </div>
      </div>
    </div>
  );
}
