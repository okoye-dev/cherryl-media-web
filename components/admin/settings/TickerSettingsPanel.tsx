import React from "react";
import type { EditorialCopy } from "@/config/editorial-copy";
import { Panel } from "@/components/admin/ui";
import { Field } from "./Field";

interface TickerSettingsPanelProps {
  copy: EditorialCopy;
  setCopy: React.Dispatch<React.SetStateAction<EditorialCopy>>;
}

export function TickerSettingsPanel({ copy, setCopy }: TickerSettingsPanelProps) {
  const set = (k: "label" | "customNotice") => (v: string) =>
    setCopy((prev) => ({ ...prev, ticker: { ...prev.ticker, [k]: v } }));
  return (
    <Panel title="News ticker" description="The strip of headlines across the top of the site.">
      <div className="grid grid-cols-1 gap-4">
        <Field label="Label" maxLength={40} value={copy.ticker.label} onChange={set("label")} className="sm:max-w-[12rem]" />
        <Field
          label="Notice (optional)"
          maxLength={280}
          value={copy.ticker.customNotice}
          onChange={set("customNotice")}
          rows={2}
          note="Shows as the first item in the ticker. Leave empty for none."
        />
      </div>
      <div className="mt-5 min-w-0 rounded-lg border border-white/10 bg-[#0d0e12] p-3">
        <p className="text-[0.7rem] font-medium text-zinc-500">Preview</p>
        <div className="mt-2 flex min-w-0 items-center gap-3">
          <span className="shrink-0 rounded bg-brand-red px-2 py-0.5 text-xs font-semibold text-white">{copy.ticker.label}</span>
          <span className="truncate text-sm text-zinc-200">{copy.ticker.customNotice}</span>
        </div>
      </div>
    </Panel>
  );
}
