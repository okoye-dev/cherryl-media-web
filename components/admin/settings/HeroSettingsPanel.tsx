import React from "react";
import type { EditorialCopy } from "@/lib/settings";
import { Panel } from "@/components/admin/ui";
import { Field } from "./Field";

interface HeroSettingsPanelProps {
  copy: EditorialCopy;
  setCopy: React.Dispatch<React.SetStateAction<EditorialCopy>>;
}

/** Stored as three parts. Shown as one line with the accent word between asterisks. */
function joinHeadline(h: { titleLead: string; titleAccent: string; titleTrail: string }) {
  if (!h.titleAccent) return h.titleLead + h.titleTrail;
  return `${h.titleLead}*${h.titleAccent}*${h.titleTrail}`;
}

function splitHeadline(text: string) {
  const open = text.indexOf("*");
  const close = open >= 0 ? text.indexOf("*", open + 1) : -1;
  if (open < 0 || close < 0) return { titleLead: text, titleAccent: "", titleTrail: "" };
  return {
    titleLead: text.slice(0, open),
    titleAccent: text.slice(open + 1, close),
    titleTrail: text.slice(close + 1),
  };
}

export function HeroSettingsPanel({ copy, setCopy }: HeroSettingsPanelProps) {
  const hero = copy.hero;
  const setField = (k: "editionBadge" | "description") => (v: string) =>
    setCopy((prev) => ({ ...prev, hero: { ...prev.hero, [k]: v } }));
  const setHeadline = (v: string) => setCopy((prev) => ({ ...prev, hero: { ...prev.hero, ...splitHeadline(v) } }));

  return (
    <Panel title="Homepage top" description="Top of the homepage.">
      <div className="grid grid-cols-1 gap-4">
        <Field label="Badge" maxLength={60} value={hero.editionBadge} onChange={setField("editionBadge")} className="sm:max-w-xs" />
        <Field
          label="Headline"
          maxLength={280}
          value={joinHeadline(hero)}
          onChange={setHeadline}
          note="Put *asterisks* around the word that shows in italic red."
        />
        <Field label="Description" maxLength={400} value={hero.description} onChange={setField("description")} rows={3} />
      </div>
      <div className="mt-5 min-w-0 rounded-lg border border-white/10 bg-[#0d0e12] p-3 sm:p-4">
        <p className="text-[0.7rem] font-medium text-zinc-500">Preview</p>
        <p className="mt-3 text-xs font-medium text-brand-red">{hero.editionBadge}</p>
        <h3 className="mt-1.5 whitespace-pre-wrap break-words text-2xl font-bold leading-tight text-white">
          <span>{hero.titleLead}</span>
          <span className="font-serif italic text-brand-red">{hero.titleAccent}</span>
          <span>{hero.titleTrail}</span>
        </h3>
        <p className="mt-2 max-w-xl text-sm text-zinc-400">{hero.description}</p>
      </div>
    </Panel>
  );
}
