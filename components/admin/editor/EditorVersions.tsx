import { useState } from "react";
import { Badge, Btn, Label, Panel, TextInput } from "@/components/admin/ui";
import type { StoryVersion } from "@/hooks/useVersions";
import { MAX_VERSIONS } from "@/hooks/useVersions";
import { ChevronDown, ChevronUp } from "./icons";
import EditorVersionPreview, { formatSavedAt } from "./EditorVersionPreview";

interface EditorVersionsProps {
  versions: StoryVersion[];
  storageFailed: boolean;
  onSaveMine: (name: string) => void;
  onWriteMyOwn: () => void;
  onRestore: (v: StoryVersion) => void;
  onDelete: (id: string) => void;
}

export default function EditorVersions({
  versions,
  storageFailed,
  onSaveMine,
  onWriteMyOwn,
  onRestore,
  onDelete,
}: EditorVersionsProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [preview, setPreview] = useState<StoryVersion | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmWrite, setConfirmWrite] = useState(false);

  const sorted = [...versions].sort((a, b) => (Date.parse(b.savedAt) || 0) - (Date.parse(a.savedAt) || 0));

  return (
    <Panel>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex min-h-10 w-full items-center justify-between gap-3 text-left sm:pointer-events-none"
      >
        <span className="min-w-0">
          <span className="block text-base font-semibold tracking-tight text-white">Versions</span>
          <span className="mt-0.5 block truncate text-xs text-zinc-400">
            {versions.length === 0 ? "Saved in this browser only" : `${versions.length} of ${MAX_VERSIONS} saved in this browser`}
          </span>
        </span>
        <span className="shrink-0 text-zinc-400 sm:hidden">{open ? <ChevronUp /> : <ChevronDown />}</span>
      </button>

      <div className={`${open ? "block" : "hidden"} mt-4 space-y-4 sm:block`}>
        <div className="space-y-2">
          <Label htmlFor="version-name" hint="optional">
            Name for my version
          </Label>
          <TextInput
            id="version-name"
            maxLength={60}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Shorter intro"
          />
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <Btn
              onClick={() => {
                onSaveMine(name.trim());
                setName("");
              }}
            >
              Save my version
            </Btn>
            {confirmWrite ? (
              <Btn
                variant="danger"
                onClick={() => {
                  onWriteMyOwn();
                  setConfirmWrite(false);
                }}
              >
                Clear and start
              </Btn>
            ) : (
              <Btn onClick={() => setConfirmWrite(true)}>Write my own</Btn>
            )}
          </div>
          {confirmWrite && (
            <p className="text-xs text-zinc-400">
              This empties the editor. The AI draft stays saved below.{" "}
              <button type="button" className="inline-flex h-10 items-center text-zinc-200 underline" onClick={() => setConfirmWrite(false)}>
                Cancel
              </button>
            </p>
          )}
          {storageFailed && <p className="text-xs text-amber-300">This browser would not store the version. Free some space and try again.</p>}
        </div>

        {sorted.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 p-5 text-center text-sm text-zinc-500">
            No versions yet. An AI draft is saved here the first time AI fills the story.
          </div>
        ) : (
          <ul className="space-y-2">
            {sorted.map((v) => (
              <li
                key={v.id}
                className="relative flex flex-col gap-2 rounded-xl border border-white/10 bg-[#1A1D24] p-3 transition-colors hover:border-white/25 hover:bg-[#20232b] sm:flex-row sm:items-center sm:justify-between"
              >
                <button
                  type="button"
                  onClick={() => setPreview(v)}
                  className="min-w-0 text-left after:absolute after:inset-0 after:content-['']"
                  aria-label={`View ${v.label}`}
                >
                  <span className="flex items-center gap-2">
                    <Badge tone={v.kind === "ai" ? "ai" : "neutral"}>{v.kind === "ai" ? "AI" : "Mine"}</Badge>
                    <span className="truncate text-sm font-medium text-white">{v.label}</span>
                  </span>
                  <span className="mt-1 block truncate text-xs text-zinc-500">
                    {formatSavedAt(v.savedAt)}
                    {v.payload.title ? `, ${v.payload.title}` : ""}
                  </span>
                </button>
                <div className="relative z-10 grid shrink-0 grid-cols-2 gap-2 sm:flex">
                  {confirmId === v.id ? (
                    <>
                      <Btn
                        variant="primary"
                        size="sm"
                        className="!h-10"
                        onClick={() => {
                          onRestore(v);
                          setConfirmId(null);
                        }}
                      >
                        Replace editor
                      </Btn>
                      <Btn size="sm" className="!h-10" onClick={() => setConfirmId(null)}>
                        Cancel
                      </Btn>
                    </>
                  ) : (
                    <>
                      <Btn size="sm" className="!h-10" onClick={() => setConfirmId(v.id)}>
                        Restore
                      </Btn>
                      <Btn size="sm" variant="danger" className="!h-10" onClick={() => onDelete(v.id)}>
                        Delete
                      </Btn>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <EditorVersionPreview version={preview} onClose={() => setPreview(null)} onRestore={onRestore} />
    </Panel>
  );
}
