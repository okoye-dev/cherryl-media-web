import React from "react";
import type { EditorialCopy } from "@/lib/settings";

interface FooterSettingsPanelProps {
  copy: EditorialCopy;
  setCopy: React.Dispatch<React.SetStateAction<EditorialCopy>>;
}

export function FooterSettingsPanel({ copy, setCopy }: FooterSettingsPanelProps) {
  return (
    <div className="space-y-6">
      <div className="border-b border-white/[0.08] pb-3">
        <h2 className="text-base font-semibold text-white">Newsroom Masthead &amp; Legal Footer</h2>
        <p className="text-xs text-zinc-400">
          Controls the publication tagline, bureau locations, contact email, and copyright.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
            Editorial Tagline
          </label>
          <input
            type="text"
            value={copy.footer.tagline}
            onChange={(e) =>
              setCopy((prev) => ({
                ...prev,
                footer: { ...prev.footer, tagline: e.target.value },
              }))
            }
            className="w-full rounded-lg border border-white/10 bg-zinc-900/80 px-3.5 py-2 text-xs text-white focus:border-brand-red focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Bureau Locations
            </label>
            <input
              type="text"
              value={copy.footer.locations}
              onChange={(e) =>
                setCopy((prev) => ({
                  ...prev,
                  footer: { ...prev.footer, locations: e.target.value },
                }))
              }
              className="w-full rounded-lg border border-white/10 bg-zinc-900/80 px-3.5 py-2 text-xs text-white focus:border-brand-red focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Newsroom Contact Email
            </label>
            <input
              type="email"
              value={copy.footer.contactEmail}
              onChange={(e) =>
                setCopy((prev) => ({
                  ...prev,
                  footer: { ...prev.footer, contactEmail: e.target.value },
                }))
              }
              className="w-full rounded-lg border border-white/10 bg-zinc-900/80 px-3.5 py-2 text-xs text-white focus:border-brand-red focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
            Copyright Notice
          </label>
          <input
            type="text"
            value={copy.footer.copyrightNotice}
            onChange={(e) =>
              setCopy((prev) => ({
                ...prev,
                footer: { ...prev.footer, copyrightNotice: e.target.value },
              }))
            }
            className="w-full rounded-lg border border-white/10 bg-zinc-900/80 px-3.5 py-2 text-xs text-white focus:border-brand-red focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
