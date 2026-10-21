import { useState } from "react";
import { Badge, Btn, Sheet } from "@/components/admin/ui";
import { SheetCloseBtn } from "@/components/admin/SheetCloseBtn";
import type { StoryVersion } from "@/hooks/useVersions";

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
    <Sheet
      onClose={close}
      title={version.label}
      subtitle={
        <span className="flex flex-wrap items-center gap-2">
          <Badge tone={version.kind === "ai" ? "ai" : "neutral"}>{version.kind === "ai" ? "AI" : "Mine"}</Badge>
          <span>{formatSavedAt(version.savedAt)}</span>
        </span>
      }
      footer={
          armed ? (
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
              <SheetCloseBtn block />
            </>
          )
      }
    >
        <div className="space-y-4">
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
    </Sheet>
  );
}
