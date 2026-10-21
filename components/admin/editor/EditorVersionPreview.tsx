import { useState } from "react";
import { Badge, Btn } from "@/components/admin/ui";
import type { StoryVersion } from "@/hooks/useVersions";
import { CloseIcon } from "./icons";

interface EditorVersionPreviewProps {
  version: StoryVersion | null;
  onClose: () => void;
  onRestore: (v: StoryVersion) => void;
}

export function formatSavedAt(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString([], { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

/** Read-only look at a saved version. Full-screen on phones, a dialog from sm. */
export default function EditorVersionPreview({ version, onClose, onRestore }: EditorVersionPreviewProps) {
  const [armed, setArmed] = useState(false);
  if (!version) return null;

  const p = version.payload;
  const paragraphs = (p.body || [])
    .filter((b) => b.type === "paragraph" && b.text.trim())
    .slice(0, 3)
    .map((b) => (b.type === "paragraph" ? b.text : ""));
  const close = () => {
    setArmed(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-stretch justify-center bg-black/80 backdrop-blur-sm animate-fade sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="flex h-full w-full flex-col bg-[#16181D] sm:h-auto sm:max-h-[90vh] sm:max-w-xl sm:rounded-2xl sm:border sm:border-white/10 sm:shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-white/[0.08] px-4 py-3 sm:px-6 sm:py-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={version.kind === "ai" ? "ai" : "neutral"}>{version.kind === "ai" ? "AI" : "Mine"}</Badge>
              <span className="text-xs text-zinc-400">{formatSavedAt(version.savedAt)}</span>
            </div>
            <h3 className="mt-1 truncate text-base font-semibold tracking-tight text-white">{version.label}</h3>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="-mr-2 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/[0.06] hover:text-white"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6">
          <p className="text-[0.7rem] font-medium text-zinc-500">Read only preview</p>
          <h4 className="text-lg font-semibold leading-snug text-white">{p.title || "No title"}</h4>
          {(p.excerpt || p.subtitle) && <p className="text-sm leading-relaxed text-zinc-300">{p.excerpt || p.subtitle}</p>}
          {paragraphs.length > 0 ? (
            <div className="space-y-3 border-t border-white/[0.08] pt-4">
              {paragraphs.map((t, i) => (
                <p key={i} className="text-sm leading-relaxed text-zinc-400">
                  {t}
                </p>
              ))}
            </div>
          ) : (
            <p className="border-t border-white/[0.08] pt-4 text-sm text-zinc-500">No body text in this version.</p>
          )}
          <p className="text-xs text-zinc-500">
            {(p.body || []).length} blocks, {(p.sources || []).length} sources, {(p.tags || []).length} tags
          </p>
        </div>

        <div className="flex flex-col gap-2 border-t border-white/[0.08] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end sm:px-6 sm:py-4">
          {armed ? (
            <>
              <p className="text-xs text-zinc-300 sm:mr-auto sm:self-center">This replaces what is in the editor now.</p>
              <Btn
                variant="primary"
                block
                onClick={() => {
                  onRestore(version);
                  close();
                }}
              >
                Confirm restore
              </Btn>
              <Btn block onClick={() => setArmed(false)}>
                Cancel
              </Btn>
            </>
          ) : (
            <>
              <Btn variant="primary" block onClick={() => setArmed(true)}>
                Restore
              </Btn>
              <Btn block onClick={close}>
                Close
              </Btn>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
