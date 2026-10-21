import { useState } from "react";
import { Badge, Btn, Label, Panel, TextInput } from "@/components/admin/ui";
import { expectedFormatPrompt, EXPECTED_FORMAT } from "@/hooks/aiFill";
import type { ApplyResult } from "@/hooks/useAiAssist";
import type { LeadCandidate } from "@/services/articles";
import { ChevronDown, ChevronUp, SparkIcon } from "./icons";

interface EditorAIPanelProps {
  lead: LeadCandidate | null;
  leadStatus: "idle" | "loading" | "ready" | "error";
  leadApplied: boolean;
  aiCount: number;
  onUseDraft: () => void;
  onStartBlank: () => void;
  onPaste: (raw: string) => { ok: true; result: ApplyResult } | { ok: false; error: string };
  onCopyContext: () => void;
  copiedAI: boolean;
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export default function EditorAIPanel({
  lead,
  leadStatus,
  leadApplied,
  aiCount,
  onUseDraft,
  onStartBlank,
  onPaste,
  onCopyContext,
  copiedAI,
}: EditorAIPanelProps) {
  // Folded on phones so it does not push the story down. Always open from sm.
  const [open, setOpen] = useState(false);
  const [showFormat, setShowFormat] = useState(false);
  const [formatCopied, setFormatCopied] = useState(false);
  const [raw, setRaw] = useState("");
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  const handleFill = () => {
    const res = onPaste(raw);
    if (!res.ok) {
      setMessage({ tone: "error", text: res.error });
      return;
    }
    const { filled, skipped } = res.result;
    setMessage({
      tone: "ok",
      text:
        filled === 0
          ? "Nothing filled. Those fields already have your text."
          : `Filled ${filled} ${filled === 1 ? "field" : "fields"}${skipped ? `, kept ${skipped} you already wrote` : ""}. Review the AI marks.`,
    });
    if (filled > 0) setRaw("");
  };

  const summary =
    leadStatus === "loading"
      ? "Loading the lead"
      : aiCount > 0
      ? `${aiCount} ${aiCount === 1 ? "item" : "items"} filled by AI, waiting for review`
      : "Fill fields from a lead or from pasted AI output";

  return (
    <Panel tone="ai">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex min-h-10 w-full items-center justify-between gap-3 text-left sm:pointer-events-none"
      >
        <span className="min-w-0">
          <span className="flex items-center gap-2 text-base font-semibold tracking-tight text-white">
            <SparkIcon />
            AI assist
          </span>
          <span className="mt-0.5 block truncate text-xs text-zinc-400">{summary}</span>
        </span>
        <span className="shrink-0 text-zinc-400 sm:hidden">{open ? <ChevronUp /> : <ChevronDown />}</span>
      </button>

      <div className={`${open ? "block" : "hidden"} mt-4 space-y-5 sm:block`}>
        {leadStatus === "error" && <p className="text-xs text-red-300">Could not load that lead. You can still paste from AI below.</p>}

        {lead && (
          <div className="space-y-3 rounded-lg border border-white/10 bg-black/20 p-3">
            <p className="text-xs font-medium text-violet-200">Lead</p>
            {lead.pitch && <p className="text-sm leading-relaxed text-zinc-200">{lead.pitch}</p>}
            <div className="flex flex-wrap gap-2">
              <Badge>{lead.extractedFacts?.length ?? 0} facts</Badge>
              <Badge>{lead.sources?.length ?? 0} sources</Badge>
              {typeof lead.relevanceScore === "number" && <Badge tone="ai">{Math.round(lead.relevanceScore * 100)}% relevant</Badge>}
            </div>
            <div className="grid grid-cols-1 gap-2 sm:flex">
              {!leadApplied && (
                <Btn variant="primary" onClick={onUseDraft}>
                  Use AI draft
                </Btn>
              )}
              {aiCount > 0 && <Btn onClick={onStartBlank}>Start blank</Btn>}
            </div>
          </div>
        )}

        <div>
          <Label htmlFor="ai-paste" hint="JSON from ChatGPT, Claude or Gemini">
            Paste from AI
          </Label>
          <TextInput
            id="ai-paste"
            multiline
            value={raw}
            onChange={(e) => {
              setRaw(e.target.value);
              setMessage(null);
            }}
            placeholder='{ "title": "...", "body": ["..."] }'
            className="min-h-28 max-h-72 overflow-y-auto font-mono"
          />
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
            <Btn variant="primary" disabled={!raw.trim()} onClick={handleFill}>
              Fill fields
            </Btn>
            {message && (
              <p className={`text-xs ${message.tone === "error" ? "text-red-300" : "text-emerald-300"}`}>{message.text}</p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-2 sm:flex">
            <Btn onClick={onCopyContext}>{copiedAI ? "Copied" : "Copy context for AI"}</Btn>
            <Btn variant="ghost" onClick={() => setShowFormat((v) => !v)} aria-expanded={showFormat}>
              {showFormat ? "Hide expected format" : "Show expected format"}
            </Btn>
          </div>
          {showFormat && (
            <div className="space-y-2">
              <p className="text-xs text-zinc-400">Paste this into your AI chat so it answers in the right shape.</p>
              <pre className="max-w-full overflow-x-auto rounded-lg border border-white/10 bg-black/30 p-3 text-xs leading-relaxed text-zinc-300">
                {EXPECTED_FORMAT}
              </pre>
              <Btn
                onClick={async () => {
                  setFormatCopied(await copyText(expectedFormatPrompt()));
                  setTimeout(() => setFormatCopied(false), 2500);
                }}
              >
                {formatCopied ? "Copied" : "Copy as instruction"}
              </Btn>
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}
