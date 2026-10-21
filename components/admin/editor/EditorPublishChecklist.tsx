import { Btn } from "@/components/admin/ui";
import { CloseIcon } from "./icons";

export interface MissingItem {
  id: string;
  /** What is wrong, in plain words */
  problem: string;
  /** The button text: what to do about it */
  action: string;
}

interface EditorPublishChecklistProps {
  items: MissingItem[] | null;
  onClose: () => void;
  onGo: (item: MissingItem) => void;
  onSaveDraft: () => void;
  canSaveDraft: boolean;
  isSaving: boolean;
}

/** Shown when Publish is pressed and something is missing. Each row takes the person to the field. */
export default function EditorPublishChecklist({ items, onClose, onGo, onSaveDraft, canSaveDraft, isSaving }: EditorPublishChecklistProps) {
  if (!items || items.length === 0) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-stretch justify-center bg-black/80 backdrop-blur-sm animate-fade sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="publish-checklist-title"
        className="flex h-full w-full flex-col bg-[#16181D] sm:h-auto sm:max-h-[90vh] sm:max-w-lg sm:rounded-2xl sm:border sm:border-white/10 sm:shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-white/[0.08] px-4 py-3 sm:px-6 sm:py-4">
          <div className="min-w-0">
            <h3 id="publish-checklist-title" className="text-base font-semibold tracking-tight text-white">
              Before you can publish
            </h3>
            <p className="mt-0.5 text-xs text-zinc-400">
              {items.length} {items.length === 1 ? "thing needs" : "things need"} your attention.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/[0.06] hover:text-white"
          >
            <CloseIcon />
          </button>
        </div>

        <ul className="flex-1 space-y-2 overflow-y-auto px-4 py-4 sm:px-6">
          {items.map((it) => (
            <li
              key={it.id}
              className="flex flex-col gap-2 rounded-xl border border-white/10 bg-[#1A1D24] p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <p className="min-w-0 text-sm text-zinc-200">{it.problem}</p>
              <Btn onClick={() => onGo(it)} arrow="forward" block className="sm:shrink-0">
                {it.action}
              </Btn>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-2 border-t border-white/[0.08] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end sm:px-6 sm:py-4">
          <Btn variant="primary" block disabled={!canSaveDraft || isSaving} onClick={onSaveDraft}>
            {isSaving ? "Saving" : canSaveDraft ? "Save draft" : "Draft saved"}
          </Btn>
          <Btn block onClick={onClose}>
            Close
          </Btn>
        </div>
      </div>
    </div>
  );
}
