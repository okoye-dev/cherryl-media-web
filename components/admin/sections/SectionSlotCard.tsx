import React from "react";
import type { CanonicalArticle } from "@/lib/types";

interface SectionSlotCardProps {
  sectionKey: string;
  artId: string;
  slotIndex: number;
  totalSlots: number;
  maxSlots: number;
  article?: CanonicalArticle;
  onMoveSlot: (sectionKey: string, fromIndex: number, toIndex: number) => void;
  onOpenPicker: (sectionKey: string, slotIndex: number) => void;
  onRemoveSlot: (sectionKey: string, slotIndex: number) => void;
}

export function SectionSlotCard({
  sectionKey,
  artId,
  slotIndex,
  totalSlots,
  maxSlots,
  article,
  onMoveSlot,
  onOpenPicker,
  onRemoveSlot,
}: SectionSlotCardProps) {
  return (
    <div className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-white/[0.05] bg-white/[0.02] p-4 transition-colors hover:border-white/10 hover:bg-white/[0.04]">
      <div className="flex items-center gap-4 min-w-0">
        <span className="font-mono text-xs font-bold text-zinc-500 w-6">
          0{slotIndex + 1}
        </span>

        {article?.featuredImage?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.featuredImage.url}
            alt={article.title}
            className="h-14 w-20 flex-shrink-0 rounded-lg object-cover border border-white/10"
          />
        ) : (
          <div className="h-14 w-20 flex-shrink-0 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center text-[0.65rem] font-mono text-zinc-500">
            NO IMG
          </div>
        )}

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {article?.kicker && (
              <span className="font-mono text-[0.65rem] font-semibold uppercase tracking-wider text-brand-red truncate max-w-[200px]">
                {article.kicker}
              </span>
            )}
            <span className="rounded bg-white/[0.06] px-1.5 py-0.2 font-mono text-[0.62rem] text-zinc-400">
              {article?.categoryName || article?.category || "Article"}
            </span>
          </div>
          <h3 className="mt-1 text-xs sm:text-sm font-medium text-white truncate max-w-xl">
            {article?.title || `Article ID: ${artId}`}
          </h3>
          <div className="mt-1 flex items-center gap-3 text-[0.68rem] text-zinc-400">
            <span>
              By{" "}
              {typeof article?.author === "string"
                ? article?.author
                : article?.author?.name || "Editorial Desk"}
            </span>
            <span>·</span>
            <span className="font-mono text-zinc-500 truncate max-w-[150px]">{artId}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center">
        {/* Reorder Buttons */}
        {maxSlots > 1 && (
          <div className="flex items-center rounded-lg border border-white/10 bg-white/[0.02]">
            <button
              type="button"
              onClick={() => onMoveSlot(sectionKey, slotIndex, slotIndex - 1)}
              disabled={slotIndex === 0}
              className="px-2 py-1 text-xs text-zinc-400 hover:text-white disabled:opacity-20"
              title="Move Up"
            >
              ↑
            </button>
            <span className="text-zinc-600">|</span>
            <button
              type="button"
              onClick={() => onMoveSlot(sectionKey, slotIndex, slotIndex + 1)}
              disabled={slotIndex === totalSlots - 1}
              className="px-2 py-1 text-xs text-zinc-400 hover:text-white disabled:opacity-20"
              title="Move Down"
            >
              ↓
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => onOpenPicker(sectionKey, slotIndex)}
          className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-zinc-300 hover:border-white/20 hover:text-white transition-colors"
        >
          Replace
        </button>
        <button
          type="button"
          onClick={() => onRemoveSlot(sectionKey, slotIndex)}
          className="rounded-lg border border-red-500/20 bg-red-500/10 px-2 py-1 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors"
          title="Remove from slot"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
