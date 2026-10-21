import { Btn, Sheet } from "@/components/admin/ui";
import { SheetCloseBtn } from "@/components/admin/SheetCloseBtn";
import { formatCategoryName } from "@/lib/formatters";
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
    <Sheet
      open={isOpen}
      onClose={onClose}
      width="sm"
      title={step === "done" ? "Story published" : "Publishing"}
      subtitle="Cherryl Newsroom"
      footer={
          step === "done" ? (
            <>
              <Btn variant="primary" href={`/article/${publishedSlug}`} target="_blank" arrow="forward" block>
                View live story
              </Btn>
              <Btn href="/admin" block>
                Back to stories
              </Btn>
              <SheetCloseBtn variant="ghost" block>
                Keep editing
              </SheetCloseBtn>
            </>
          ) : errorMessage ? (
            <>
              <Btn variant="primary" onClick={onSaveDraft} disabled={isSaving} block className="order-first sm:order-last">
                {isSaving ? "Saving" : "Save as draft"}
              </Btn>
              <SheetCloseBtn block />
            </>
          ) : null
      }
    >
        <div className="space-y-5">
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
    </Sheet>
  );
}
