import Link from "next/link";
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
  onRetry: () => void;
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
  onRetry,
}: EditorPublishModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#16181D] p-6 shadow-2xl text-left space-y-6">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div>
            <span className="font-mono text-[0.65rem] uppercase tracking-widest text-brand-red font-semibold">
              CHERRYL NEWSROOM
            </span>
            <h3 className="text-lg font-semibold text-white tracking-tight">
              {step === "done" ? "Story Published Successfully" : "Publishing Verification Pipeline"}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="text-zinc-400 hover:text-white text-sm">
            ✕
          </button>
        </div>

        {/* Error banner */}
        {errorMessage && (
          <div className="rounded-xl border border-red-500/40 bg-red-950/30 p-3.5 text-xs text-red-200 space-y-2">
            <div className="font-semibold flex items-center gap-2">
              <span>⚠️ Upload or Verification Required</span>
            </div>
            <p className="text-[0.78rem] text-red-300 leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {/* 3-Step Progress Indicators */}
        <div className="space-y-4">
          {/* Step 1 */}
          <div className="flex items-start gap-3.5">
            <div className="mt-0.5">
              {stepStates.media === "success" && (
                <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-xs font-bold">
                  ✓
                </div>
              )}
              {stepStates.media === "running" && (
                <div className="h-6 w-6 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
              )}
              {stepStates.media === "error" && (
                <div className="h-6 w-6 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center text-xs font-bold">
                  !
                </div>
              )}
              {stepStates.media === "pending" && (
                <div className="h-6 w-6 rounded-full border border-white/20 text-zinc-500 flex items-center justify-center text-xs font-mono">
                  1
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-zinc-200">1. Media &amp; Storage Verification</h4>
              <p className="text-[0.72rem] text-zinc-400">
                {stepStates.media === "success"
                  ? "Cover photo and inline media confirmed stored"
                  : stepStates.media === "running"
                  ? "Verifying image assets and uploads..."
                  : stepStates.media === "error"
                  ? "Storage check failed — see error above"
                  : "Awaits image upload confirmation"}
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3.5">
            <div className="mt-0.5">
              {stepStates.editorial === "success" && (
                <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-xs font-bold">
                  ✓
                </div>
              )}
              {stepStates.editorial === "running" && (
                <div className="h-6 w-6 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
              )}
              {stepStates.editorial === "error" && (
                <div className="h-6 w-6 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center text-xs font-bold">
                  !
                </div>
              )}
              {stepStates.editorial === "pending" && (
                <div className="h-6 w-6 rounded-full border border-white/20 text-zinc-500 flex items-center justify-center text-xs font-mono">
                  2
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-zinc-200">
                2. Editorial Integrity &amp; Category Verification
              </h4>
              <p className="text-[0.72rem] text-zinc-400">
                {stepStates.editorial === "success"
                  ? `Verified headline, author (${authorName}), category (${category}), and ${blockCount} ordered blocks`
                  : stepStates.editorial === "running"
                  ? "Checking editorial fields and sequence..."
                  : "Validates article structure, category, and sequence"}
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3.5">
            <div className="mt-0.5">
              {stepStates.engine === "success" && (
                <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-xs font-bold">
                  ✓
                </div>
              )}
              {stepStates.engine === "running" && (
                <div className="h-6 w-6 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
              )}
              {stepStates.engine === "error" && (
                <div className="h-6 w-6 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center text-xs font-bold">
                  !
                </div>
              )}
              {stepStates.engine === "pending" && (
                <div className="h-6 w-6 rounded-full border border-white/20 text-zinc-500 flex items-center justify-center text-xs font-mono">
                  3
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-zinc-200">
                3. Live Sync to Cherryl Media Backend
              </h4>
              <p className="text-[0.72rem] text-zinc-400">
                {stepStates.engine === "success"
                  ? "Dispatched to PostgreSQL database, RSS feeds, and public reader endpoints"
                  : stepStates.engine === "running"
                  ? "Transmitting article payload to Go backend..."
                  : "Synchronizes published dispatch with web and feeds"}
              </p>
            </div>
          </div>
        </div>

        {/* Success state */}
        {step === "done" && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>Story is now published and active on the website</span>
            </div>
            <p className="font-area text-sm font-semibold text-white leading-snug line-clamp-2">{title}</p>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Link
                href={`/article/${publishedSlug}`}
                target="_blank"
                className="rounded-lg bg-brand-red px-3.5 py-1.5 text-xs font-semibold text-white shadow hover:bg-brand-red/90 transition-colors inline-flex items-center gap-1.5"
              >
                <span>View Live Story ↗</span>
              </Link>
              <Link
                href="/admin"
                className="rounded-lg border border-white/15 bg-zinc-800 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 transition-colors"
              >
                Return to Newsroom Desk
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-3 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
              >
                Continue Editing
              </button>
            </div>
          </div>
        )}

        {/* Action buttons */}
        {step !== "done" && (
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/[0.08]">
            {errorMessage && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-zinc-800 hover:bg-zinc-700 px-4 py-2 text-xs font-medium text-white transition-colors"
              >
                Close &amp; Fix Issue
              </button>
            )}
            {errorMessage && (
              <button
                type="button"
                onClick={onRetry}
                className="rounded-lg bg-brand-red hover:bg-brand-red/90 px-4 py-2 text-xs font-semibold text-white shadow transition-colors"
              >
                Retry Publishing
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
