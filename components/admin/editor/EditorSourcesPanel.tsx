import { AIChip, Btn, Label, Panel, TextInput } from "@/components/admin/ui";
import type { SourceItem } from "@/lib/editor/fields";
import { PlusIcon, SparkIcon, TrashIcon } from "./icons";
import { LIMITS } from "./limits";

interface Props {
  sources: SourceItem[];
  onChange: (update: (prev: SourceItem[]) => SourceItem[]) => void;
  isAi: boolean;
  copiedAI: boolean;
  onCopyAI: () => void;
}

export default function EditorSourcesPanel({ sources, onChange, isAi, copiedAI, onCopyAI }: Props) {
  const patch = (idx: number, change: Partial<SourceItem>) =>
    onChange((prev) => prev.map((item, i) => (i === idx ? { ...item, ...change } : item)));

  return (
    <div className="space-y-4">
      <Panel
        tone="ai"
        title="Check this story with AI"
        description="Copies the headline, sources, body and social drafts so you can paste them into an AI tool to fact-check."
        actions={
          <Btn onClick={onCopyAI} block>
            <SparkIcon />
            {copiedAI ? "Copied" : "Copy for AI"}
          </Btn>
        }
      />

      <Panel
        title="Sources"
        description="Every claim should trace back to an official or public record."
        actions={
          <>
            {isAi && <AIChip />}
            <Btn block onClick={() => onChange((prev) => [...prev, { url: "", publisher: "", claimSummary: "" }])}>
              <PlusIcon />
              Add source
            </Btn>
          </>
        }
      >
        {sources.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-zinc-500">No sources yet.</div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {sources.map((s, idx) => (
              <div key={idx} className="space-y-3 rounded-xl border border-white/10 bg-[#1A1D24] p-3 sm:p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-zinc-300">Source {idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => onChange((prev) => prev.filter((_, i) => i !== idx))}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-red-400 sm:h-9 sm:w-9"
                    aria-label={`Remove source ${idx + 1}`}
                    title="Remove source"
                  >
                    <TrashIcon />
                  </button>
                </div>
                <div>
                  <Label>Publisher</Label>
                  <TextInput
                    maxLength={LIMITS.sourcePublisher}
                    value={s.publisher}
                    onChange={(e) => patch(idx, { publisher: e.target.value })}
                    placeholder="e.g. State House Official Gazette"
                  />
                </div>
                <div>
                  <Label>Link</Label>
                  <TextInput
                    maxLength={LIMITS.sourceUrl}
                    value={s.url}
                    onChange={(e) => patch(idx, { url: e.target.value })}
                    className="font-mono"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label>What it confirms</Label>
                  <TextInput
                    multiline
                    maxLength={LIMITS.claimSummary}
                    value={s.claimSummary || ""}
                    onChange={(e) => patch(idx, { claimSummary: e.target.value })}
                    placeholder="e.g. Official confirmation of the new tariff"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
