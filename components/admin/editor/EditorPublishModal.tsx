import { Btn } from "@/components/admin/ui";
import { formatCategoryName } from "@/lib/formatters";
import { CloseIcon } from "./icons";
import type { PublishStep, StepState } from "@/hooks/usePublishPipeline";

interface EditorPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  step: PublishStep;
  stepStates: {
    media: StepState;
    editorial: StepState;
    engine: StepState;
  };
  errorMessage: string | null;
  publishedSlug: string;
  title: string;
  authorName: string;
  category: string;
  blockCount: number;
  onSaveDraft: () => void;
  isSaving: boolean;
}

function StepIcon({ state, n }: { state: StepState; n: number }) {
  const base = "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold";
  if (state === "success") return <div className={`${base} border border-emerald-500/40 bg-emerald-500/20 text-emerald-400`}>&#10003;</div>;
  if (state === "running") return <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />;
  if (state === "error") return <div className={`${base} border border-red-500/40 bg-red-500/20 text-red-400`}>!</div>;
  return <div className={`${base} border border-white/20 text-zinc-500`}>{n}</div>;
}

export default function EditorPublishModal({
  isOpen,
  onClose,
  step,
  stepStates,
  errorMessage,
  publishedSlug,
  title,
  authorName,
  category,
  blockCount,
  onSaveDraft,
  isSaving,
}: EditorPublishModalProps) {
  if (!isOpen) return null;

  const steps: Array<{ state: StepState; title: string; text: string }> = [
    {
      state: stepStates.media,
      title: "Check images",
      text:
        stepStates.media === "success"
          ? "Cover photo and inline media are stored"
          : stepStates.media === "running"
          ? "Checking images and uploads"
          : stepStates.media === "error"
          ? "Image check failed, see the message above"
          : "Waits for uploads to finish",
    },
    {
      state: stepStates.editorial,
      title: "Check the story",
      text:
        stepStates.editorial === "success"
          ? `Headline, ${authorName.trim() ? `author (${authorName.trim()}), ` : ""}category (${formatCategoryName(category)}) and ${blockCount} ${blockCount === 1 ? "block" : "blocks"} look right`
          : stepStates.editorial === "running"
          ? "Checking fields and block order"
          : "Checks the headline, category and block order",
    },
    {
      state: stepStates.engine,
      title: "Publish to the site",
      text:
        stepStates.engine === "success"
          ? "Saved and live on the site and feeds"
          : stepStates.engine === "running"
          ? "Sending the story to the server"
          : "Sends the story to the site and feeds",
    },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-stretch justify-center bg-black/80 backdrop-blur-sm animate-fade sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="relative flex h-full w-full flex-col overflow-y-auto bg-[#16181D] sm:h-auto sm:max-h-[90vh] sm:max-w-lg sm:rounded-2xl sm:border sm:border-white/10 sm:shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-white/[0.08] px-4 py-3 sm:px-6 sm:py-4">
          <div className="min-w-0">
            <p className="text-[0.7rem] font-medium text-brand-red">Cherryl Newsroom</p>
            <h3 className="text-base font-semibold tracking-tight text-white">
              {step === "done" ? "Story published" : "Publishing"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-mr-2 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/[0.06] hover:text-white"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 space-y-5 px-4 py-4 sm:px-6 sm:py-5">
          {errorMessage && (
            <div className="space-y-1 rounded-xl border border-red-500/40 bg-red-950/30 p-3.5">
              <p className="text-sm font-medium text-red-200">The server did not accept this story</p>
              <p className="text-xs leading-relaxed text-red-300">{errorMessage}</p>
            </div>
          )}

          <ol className="space-y-4">
            {steps.map((st, i) => (
              <li key={st.title} className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  <StepIcon state={st.state} n={i + 1} />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-medium text-zinc-200">{st.title}</h4>
                  <p className="text-xs text-zinc-400">{st.text}</p>
                </div>
              </li>
            ))}
          </ol>

          {step === "done" && (
            <div className="space-y-3 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4">
              <p className="flex items-center gap-2 text-sm font-medium text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                The story is live
              </p>
              <p className="line-clamp-2 text-sm font-semibold leading-snug text-white">{title}</p>
            </div>
          )}
        </div>

        {(step === "done" || errorMessage) && (
        <div className="flex flex-col gap-2 border-t border-white/[0.08] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end sm:px-6 sm:py-4">
          {step === "done" ? (
            <>
              <Btn variant="primary" href={`/article/${publishedSlug}`} target="_blank" arrow="forward" block>
                View live story
              </Btn>
              <Btn href="/admin" block>
                Back to stories
              </Btn>
              <Btn variant="ghost" onClick={onClose} block>
                Keep editing
              </Btn>
            </>
          ) : errorMessage ? (
            <>
              <Btn variant="primary" onClick={onSaveDraft} disabled={isSaving} block className="order-first sm:order-last">
                {isSaving ? "Saving" : "Save as draft"}
              </Btn>
              <Btn onClick={onClose} block>
                Close
              </Btn>
            </>
          ) : null}
        </div>
        )}
      </div>
    </div>
  );
}
