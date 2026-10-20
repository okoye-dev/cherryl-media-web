import React from "react";
import type { CuratedSection } from "@/services/contracts/ISectionService";
import type { CanonicalArticle } from "@/lib/types";
import { SECTION_METADATA } from "@/lib/sections";
import { SectionSlotCard } from "./SectionSlotCard";

interface SectionPanelProps {
  sectionKey: string;
  section?: CuratedSection;
  articleMap: Map<string, CanonicalArticle>;
  onOpenPicker: (sectionKey: string, slotIndex: number) => void;
  onRemoveSlot: (sectionKey: string, slotIndex: number) => void;
  onMoveSlot: (sectionKey: string, fromIndex: number, toIndex: number) => void;
}

export function SectionPanel({
  sectionKey,
  section,
  articleMap,
  onOpenPicker,
  onRemoveSlot,
  onMoveSlot,
}: SectionPanelProps) {
  const meta = SECTION_METADATA[sectionKey] || {
    title: sectionKey,
    subtitle: "Curated section slot",
    maxSlots: 1,
  };

  const articleIds = section?.articleIds || [];

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#141519] p-5 sm:p-6 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-brand-red">
              {sectionKey}
            </span>
            <span className="text-xs text-zinc-500">·</span>
            <h2 className="text-sm sm:text-base font-semibold text-white">
              {meta.title}
            </h2>
            <span className="rounded bg-white/[0.05] px-2 py-0.5 font-mono text-[0.65rem] text-zinc-400">
              {articleIds.length} / {meta.maxSlots} Slots Filled
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-400">{meta.subtitle}</p>
        </div>

        {articleIds.length < meta.maxSlots && (
          <button
            type="button"
            onClick={() => onOpenPicker(sectionKey, articleIds.length)}
            className="self-start sm:self-auto rounded-lg border border-dashed border-white/20 bg-white/[0.02] px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-brand-red/50 hover:bg-white/[0.04] hover:text-white transition-all"
          >
            + Add Story Slot
          </button>
        )}
      </div>

      {/* Slot Items */}
      <div className="mt-4 space-y-3">
        {articleIds.length === 0 ? (
          <div className="flex items-center justify-between rounded-xl border border-dashed border-white/10 bg-white/[0.01] p-6 text-center text-xs text-zinc-500">
            <span>
              No articles assigned to this section. Click &ldquo;Add Story Slot&rdquo; to pick from the database.
            </span>
            <button
              type="button"
              onClick={() => onOpenPicker(sectionKey, 0)}
              className="rounded bg-white/[0.06] px-3 py-1 text-xs text-zinc-300 hover:text-white"
            >
              Assign Article
            </button>
          </div>
        ) : (
          articleIds.map((artId, idx) => {
            const article = articleMap.get(artId) || section?.articles?.[idx];
            return (
              <SectionSlotCard
                key={`${artId}-${idx}`}
                sectionKey={sectionKey}
                artId={artId}
                slotIndex={idx}
                totalSlots={articleIds.length}
                maxSlots={meta.maxSlots}
                article={article}
                onMoveSlot={onMoveSlot}
                onOpenPicker={onOpenPicker}
                onRemoveSlot={onRemoveSlot}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
