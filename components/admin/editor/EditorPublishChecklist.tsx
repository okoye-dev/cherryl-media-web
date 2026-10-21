import { Btn, Sheet } from "@/components/admin/ui";
import { SheetCloseBtn } from "@/components/admin/SheetCloseBtn";

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
    <Sheet
      onClose={onClose}
      width="sm"
      title="Before you can publish"
      subtitle={`${items.length} ${items.length === 1 ? "thing needs" : "things need"} your attention.`}
      footer={
        <>
          <Btn variant="primary" block disabled={!canSaveDraft || isSaving} onClick={onSaveDraft}>
            {isSaving ? "Saving" : canSaveDraft ? "Save draft" : "Draft saved"}
          </Btn>
          <SheetCloseBtn block />
        </>
      }
    >
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it.id} className="flex flex-col gap-2 rounded-xl border border-white/10 bg-[#1A1D24] p-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="min-w-0 text-sm text-zinc-200">{it.problem}</p>
            <Btn onClick={() => onGo(it)} arrow="forward" block className="sm:shrink-0">
              {it.action}
            </Btn>
          </li>
        ))}
      </ul>
    </Sheet>
  );
}
