import React, { useState } from "react";
import type { EditorialCopy } from "@/lib/settings";
import { Btn, Label, Panel, TextInput, inputClass } from "@/components/admin/ui";
import { Field } from "./Field";

interface DossierSettingsPanelProps {
  copy: EditorialCopy;
  setCopy: React.Dispatch<React.SetStateAction<EditorialCopy>>;
}

const BADGE_RE = /^(.*?)\s*[·•|-]\s*ISSUE\s*#?\s*(\d+)\s*$/i;

const stepBtn =
  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-lg text-zinc-200 transition-colors hover:bg-white/[0.09] hover:text-white";

export function DossierSettingsPanel({ copy, setCopy }: DossierSettingsPanelProps) {
  const [rawMode, setRawMode] = useState<boolean | null>(null);
  const badge = copy.dossier.issueBadge;
  const match = BADGE_RE.exec(badge);
  const raw = rawMode ?? !match;
  const name = match ? match[1] : "";
  const num = match ? parseInt(match[2], 10) : 1;

  const set = (k: "issueBadge" | "heading" | "subheading") => (v: string) =>
    setCopy((prev) => ({ ...prev, dossier: { ...prev.dossier, [k]: v } }));
  const compose = (n: string, i: number) => set("issueBadge")(`${n.toUpperCase()} · ISSUE #${Math.min(9999, Math.max(0, i))}`);

  return (
    <Panel title="Culture section" description="The weekend culture block on the homepage.">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          {raw ? (
            <Field label="Issue badge (full text)" maxLength={80} value={badge} onChange={set("issueBadge")} />
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="sm:w-60">
                <Label htmlFor="edition-name">Edition name</Label>
                <TextInput
                  id="edition-name"
                  maxLength={50}
                  value={name}
                  onChange={(e) => compose(e.target.value, num)}
                  placeholder="Weekend Edition"
                />
              </div>
              <div>
                <Label htmlFor="issue-number">Issue number</Label>
                <div className="flex items-center gap-2">
                  <button type="button" aria-label="Previous issue" className={stepBtn} onClick={() => compose(name, num - 1)}>
                    −
                  </button>
                  <input
                    id="issue-number"
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={num}
                    onChange={(e) => compose(name, parseInt(e.target.value, 10) || 0)}
                    className={`${inputClass} w-20 text-center`}
                  />
                  <button type="button" aria-label="Next issue" className={stepBtn} onClick={() => compose(name, num + 1)}>
                    +
                  </button>
                </div>
              </div>
            </div>
          )}
          <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-zinc-500">Shows as: {badge}</p>
            <Btn size="sm" variant="ghost" className="h-10 sm:h-9" onClick={() => setRawMode(!raw)}>
              {raw ? "Use edition and number" : "Edit the full text"}
            </Btn>
          </div>
        </div>
        <Field label="Heading" maxLength={120} value={copy.dossier.heading} onChange={set("heading")} className="md:col-span-2" />
        <Field label="Subheading" maxLength={300} value={copy.dossier.subheading} onChange={set("subheading")} rows={2} className="md:col-span-2" />
      </div>
    </Panel>
  );
}
