import React from "react";
import type { CuratedSection } from "@/services/contracts/ISectionService";
import type { CanonicalArticle } from "@/lib/types";
import { SECTION_METADATA } from "@/lib/sections";
import { Badge, Btn, Panel } from "@/components/admin/ui";
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

  return (
    <Panel
      title={meta.title}
      description={meta.subtitle}
      actions={
        <>
          <Badge>
            {articleIds.length} of {meta.maxSlots} filled
          </Badge>
          {canAdd && (
            <Btn size="sm" className="h-10 sm:h-9" onClick={() => onOpenPicker(sectionKey, articleIds.length)}>
              Add story
            </Btn>
          )}
        </>
      }
    >
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
    </Panel>
  );
}
