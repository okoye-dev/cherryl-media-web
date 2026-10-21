import { Btn } from "@/components/admin/ui";
import { CloseIcon } from "./icons";

/** A sheet for choosing something: full screen on phones, a dialog from sm. */
export default function EditorPickerSheet({
  open,
  title,
  notice,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  notice?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-stretch justify-center bg-black/80 backdrop-blur-sm animate-fade sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="flex h-full w-full flex-col bg-[#16181D] sm:h-auto sm:max-h-[90vh] sm:max-w-xl sm:rounded-2xl sm:border sm:border-white/10 sm:shadow-2xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] px-4 py-3 sm:px-6 sm:py-4">
          <h3 className="text-base font-semibold tracking-tight text-white">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/[0.06] hover:text-white"
          >
            <CloseIcon />
          </button>
        </div>
        {notice && <p className="border-b border-amber-500/20 bg-amber-500/10 px-4 py-2 text-xs text-amber-200 sm:px-6">{notice}</p>}
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">{children}</div>
        <div className="flex flex-col gap-2 border-t border-white/[0.08] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end sm:px-6 sm:py-4">
          {footer}
          <Btn block onClick={onClose}>
            Close
          </Btn>
        </div>
      </div>
    </div>
  );
}
