import React, { useState } from "react";
import type { CuratedSection } from "@/services/contracts/ISectionService";
import type { CanonicalArticle } from "@/lib/types";
import { SECTION_METADATA } from "@/lib/sections";
import Arrow from "@/components/site/Arrow";
import { Badge, Btn } from "@/components/admin/ui";
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
  const canAdd = articleIds.length < meta.maxSlots;

  const [open, setOpen] = useState(false);
  const bodyId = `section-${sectionKey}`;

  return (
    <section className="rounded-xl border border-white/[0.08] bg-[#16181D]">
      {/* The title row is one big button: tap it to open or close the section. Closed by default. */}
      <button
        type="button"
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-16 w-full items-center justify-between gap-3 rounded-xl px-3.5 py-3 text-left transition-colors hover:bg-white/[0.03] sm:px-5"
      >
        <span className="min-w-0">
          <span className="block text-lg font-semibold tracking-tight text-white lg:text-base">{meta.title}</span>
          <span className="mt-0.5 block text-xs leading-relaxed text-zinc-400">{meta.subtitle}</span>
        </span>
        <span className="flex shrink-0 items-center gap-2.5">
          <Badge>
            {articleIds.length} of {meta.maxSlots}
          </Badge>
          <Arrow className={`h-3.5 w-3.5 text-zinc-400 transition-transform ${open ? "-rotate-90" : "rotate-90"}`} />
        </span>
      </button>

      {open && (
        <div id={bodyId} className="space-y-3 border-t border-white/[0.06] p-3.5 sm:p-5">
          {canAdd && articleIds.length > 0 && (
            <Btn size="sm" className="h-10 sm:h-9" onClick={() => onOpenPicker(sectionKey, articleIds.length)}>
              Add story
            </Btn>
          )}
      {articleIds.length === 0 ? (
        <div className="flex flex-col items-stretch gap-3 rounded-lg border border-dashed border-white/10 p-5 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <span className="text-sm text-zinc-500">Nothing here yet. Pick a story from the database.</span>
          <Btn block onClick={() => onOpenPicker(sectionKey, 0)}>
            Assign story
          </Btn>
        </div>
      ) : (
        <ol className="space-y-2">
          {articleIds.map((artId, idx) => {
            const article = articleMap.get(artId) || section?.articles?.[idx];
            return (
              <li key={`${artId}-${idx}`}>
                <SectionSlotCard
                  sectionKey={sectionKey}
                  artId={artId}
                  slotIndex={idx}
                  totalSlots={articleIds.length}
                  layout={meta.maxSlots === 1 ? "feature" : "row"}
                  showImage={meta.showsImage}
                  article={article}
                  onMoveSlot={onMoveSlot}
                  onOpenPicker={onOpenPicker}
                  onRemoveSlot={onRemoveSlot}
                />
              </li>
            );
          })}
        </ol>
      )}
        </div>
      )}
    </section>
  );
}
