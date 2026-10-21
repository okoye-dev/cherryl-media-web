import React, { useState } from "react";
import type { EditorialCopy } from "@/lib/settings";
import { Btn, Label, Panel, TextInput } from "@/components/admin/ui";
import { Field } from "./Field";

interface FooterSettingsPanelProps {
  copy: EditorialCopy;
  setCopy: React.Dispatch<React.SetStateAction<EditorialCopy>>;
}

const MAX_LOCATIONS = 120;

export function FooterSettingsPanel({ copy, setCopy }: FooterSettingsPanelProps) {
  const set = (k: "tagline" | "locations" | "contactEmail" | "copyrightNotice") => (v: string) =>
    setCopy((prev) => ({ ...prev, footer: { ...prev.footer, [k]: v } }));
  const [draft, setDraft] = useState("");
  const places = copy.footer.locations
    .split(/[·•,|]/)
    .map((p) => p.trim())
    .filter(Boolean);
  const setPlaces = (list: string[]) => set("locations")(list.join(" · "));
  const full = (v: string) => [...places, v].join(" · ").length > MAX_LOCATIONS;
  const addPlace = () => {
    const v = draft.trim();
    if (!v) return;
    if (full(v)) return;
    setPlaces([...places, v]);
    setDraft("");
  };
  return (
    <Panel title="Footer" description="Bottom of every page.">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Tagline" maxLength={160} value={copy.footer.tagline} onChange={set("tagline")} className="md:col-span-2" />
        <div className="md:col-span-2">
          <Label htmlFor="new-location">Locations</Label>
          {places.length > 0 && (
            <ul className="mb-2 flex flex-wrap gap-2">
              {places.map((p, i) => (
                <li key={`${p}-${i}`} className="flex h-10 items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] pl-3.5 text-sm text-zinc-200">
                  <span>{p}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${p}`}
                    onClick={() => setPlaces(places.filter((_, j) => j !== i))}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-400 hover:text-white"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-2">
            <TextInput
              id="new-location"
              maxLength={40}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addPlace();
                }
              }}
              placeholder="Add a city"
            />
            <Btn onClick={addPlace} disabled={!draft.trim() || full(draft.trim())} className="shrink-0">
              Add location
            </Btn>
          </div>
          {full(draft.trim() || "x") && <p className="mt-1.5 text-xs text-amber-300">No room for more locations. Remove one to add another.</p>}
        </div>
        <Field label="Contact email" maxLength={120} type="email" value={copy.footer.contactEmail} onChange={set("contactEmail")} />
        <Field label="Copyright notice" maxLength={200} value={copy.footer.copyrightNotice} onChange={set("copyrightNotice")} className="md:col-span-2" />
      </div>
    </Panel>
  );
}
