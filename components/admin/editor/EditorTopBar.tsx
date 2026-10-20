import Link from "next/link";
import type { CanonicalArticle, PillarCategory, PublishingStatus } from "@/lib/types";

interface EditorTopBarProps {
  articlesList: CanonicalArticle[];
  selectedSlug: string;
  onSelectStory: (slug: string) => void;
  category: PillarCategory;
  status: PublishingStatus;
  autosaveStatus: "idle" | "saving" | "saved";
  lastAutosavedTime: string | null;
  saveMessage: string | null;
  copiedAI: boolean;
  onCopyAI: () => void;
  isSubmitting: boolean;
  inFlightUploads: number;
  onSaveDraft: () => void;
  onPublishClick: () => void;
}

export default function EditorTopBar({
  articlesList,
  selectedSlug,
  onSelectStory,
  category,
  status,
  autosaveStatus,
  lastAutosavedTime,
  saveMessage,
  copiedAI,
  onCopyAI,
  isSubmitting,
  inFlightUploads,
  onSaveDraft,
  onPublishClick,
}: EditorTopBarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-[#16181D] p-4 sm:flex-row sm:items-center sm:justify-between shadow-sm">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <Link href="/admin" className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors">
          ← All Stories
        </Link>
        <span className="text-zinc-600">/</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[0.65rem] font-mono uppercase text-zinc-500 hidden sm:inline">Story:</span>
          <select
            value={selectedSlug}
            onChange={(e) => onSelectStory(e.target.value)}
            className="rounded-lg border border-white/10 bg-zinc-900 px-2.5 py-1 text-xs font-medium text-white focus:border-brand-red focus:outline-none max-w-[200px] sm:max-w-[260px] truncate"
          >
            <option value="__new__">+ Write New Story</option>
            <optgroup label="Published Articles">
              {articlesList.map((art) => (
                <option key={art.slug} value={art.slug}>
                  {art.title}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
        <span className="text-zinc-600">/</span>
        <span className="font-mono text-xs uppercase tracking-wider text-zinc-400 truncate max-w-[140px]">
          {category}
        </span>

        <span
          className={`rounded-full px-2.5 py-0.5 text-[0.68rem] font-semibold uppercase tracking-wider border ${
            status === "published"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-amber-500/10 border-amber-500/20 text-amber-400"
          }`}
        >
          {status}
        </span>

        {/* Autosave status indicator */}
        <div className="hidden sm:flex items-center gap-1.5 pl-2 text-[0.7rem] font-mono text-zinc-400">
          {autosaveStatus === "saving" && (
            <span className="flex items-center gap-1 text-amber-400">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
              Autosaving...
            </span>
          )}
          {autosaveStatus === "saved" && lastAutosavedTime && (
            <span className="flex items-center gap-1 text-zinc-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Autosaved {lastAutosavedTime}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {saveMessage && (
          <span className="text-xs font-semibold text-emerald-400 animate-fade">{saveMessage}</span>
        )}

        <button
          type="button"
          onClick={onCopyAI}
          className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/40 bg-purple-500/15 px-3 py-1.5 text-xs font-medium text-purple-200 hover:bg-purple-500/25 hover:text-white transition-all shadow-sm"
          title="Copy editorial brief, verified sources, and text to paste into ChatGPT, Claude or Gemini for vetting"
        >
          <svg className="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
            />
          </svg>
          {copiedAI ? "✓ Copied for AI!" : "Copy Context for AI"}
        </button>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={onSaveDraft}
          className="rounded-lg border border-white/15 bg-zinc-800 px-3.5 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-700 hover:text-white transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save Draft"}
        </button>

        {inFlightUploads > 0 && (
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[0.68rem] font-mono text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
            {inFlightUploads} uploading
          </span>
        )}

        <button
          type="button"
          disabled={isSubmitting || inFlightUploads > 0}
          onClick={onPublishClick}
          className="rounded-lg bg-brand-red px-4 py-1.5 text-xs font-semibold text-white shadow hover:bg-brand-red/90 transition-colors disabled:opacity-50 flex items-center gap-1.5"
        >
          {inFlightUploads > 0 ? (
            <>
              <span className="h-2 w-2 rounded-full bg-white animate-spin" />
              <span>Uploading Media...</span>
            </>
          ) : (
            "Publish Now"
          )}
        </button>
      </div>
    </div>
  );
}
