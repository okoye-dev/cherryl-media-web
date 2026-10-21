import React from "react";
import type { CanonicalArticle } from "@/lib/types";
import Arrow from "@/components/site/Arrow";
import { Btn } from "@/components/admin/ui";
import { cn } from "@/utils";
import { formatCategoryName, formatReadTime, authorName, TEAM_BYLINE } from "@/lib/formatters";

interface SectionSlotCardProps {
  sectionKey: string;
  artId: string;
  slotIndex: number;
  totalSlots: number;
  /** "feature": a section with one slot, shown wide with a big picture. "row": one line in an ordered list. */
  layout: "feature" | "row";
  /** Whether the homepage draws this story's picture in this spot. If not, the admin shows none either. */
  showImage: boolean;
  article?: CanonicalArticle;
  onMoveSlot: (sectionKey: string, fromIndex: number, toIndex: number) => void;
  onOpenPicker: (sectionKey: string, slotIndex: number) => void;
  onRemoveSlot: (sectionKey: string, slotIndex: number) => void;
}

const iconBtn =
  "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-zinc-300 transition-colors hover:bg-white/[0.09] hover:text-white disabled:cursor-not-allowed disabled:opacity-30";

export function SectionSlotCard({
  sectionKey,
  artId,
  slotIndex,
  totalSlots,
  layout,
  showImage,
  article,
  onMoveSlot,
  onOpenPicker,
  onRemoveSlot,
}: SectionSlotCardProps) {
  const author = article ? authorName(article) : "";
  const slug = article?.slug;
  const deck = article?.deck || article?.excerpt || "";
  const kicker = article?.kicker || "";
  const readTime = article?.readTime ? formatReadTime(article.readTime) : "";
  const category = formatCategoryName(article?.categoryName || article?.category || "");
  const title = article?.title || `Article ${artId}`;
  const image = showImage ? article?.featuredImage?.url : undefined;

  const actions = (
    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
      {slug && (
        <Btn href={`/article/${slug}`} target="_blank" arrow="forward" size="sm" className="!h-10">
          View
        </Btn>
      )}
      {slug && (
        <Btn href={`/admin/editor?slug=${slug}`} size="sm" className="!h-10">
          Edit
        </Btn>
      )}
      <Btn size="sm" className="!h-10" onClick={() => onOpenPicker(sectionKey, slotIndex)}>
        Change
      </Btn>
      <Btn variant="danger" size="sm" className="!h-10" onClick={() => onRemoveSlot(sectionKey, slotIndex)}>
        Clear
      </Btn>
    </div>
  );

  if (layout === "feature") {
    return (
      <div className={cn("grid gap-4 rounded-lg border border-white/[0.07] bg-white/[0.02] p-3 sm:p-4", showImage && "md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] md:items-stretch lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)]")}>
        {/* Picture: on top on phones, on the right from md */}
        {showImage && <div className="aspect-[16/9] overflow-hidden rounded-md border border-white/10 bg-[#1A1D24] md:order-2 md:aspect-auto md:min-h-[12rem]">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-zinc-500">No image</div>
          )}
        </div>}
        <div className="flex min-w-0 flex-col justify-between gap-4 md:order-1 md:py-1">
          <div className="min-w-0">
            <p className="text-xs font-medium text-brand-red/90">{kicker || category}</p>
            <h3 className="mt-1.5 text-lg font-medium leading-snug text-white md:text-xl">{title}</h3>
            {deck && <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-zinc-300">{deck}</p>}
            <p className="mt-3 text-xs text-zinc-400">
              By {author || TEAM_BYLINE}
              {readTime && <span> &middot; {readTime}</span>}
            </p>
          </div>
          {actions}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-white/[0.07] bg-white/[0.02] p-3 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {/* Order controls: one tight pair, stacked along the list direction */}
        <div className="flex shrink-0 flex-col gap-1">
          <button
            type="button"
            aria-label="Move up"
            title="Move up"
            onClick={() => onMoveSlot(sectionKey, slotIndex, slotIndex - 1)}
            disabled={slotIndex === 0}
            className={cn(iconBtn, "!h-10 !w-10")}
          >
            <Arrow className="h-3.5 w-3.5 -rotate-90" />
          </button>
          <button
            type="button"
            aria-label="Move down"
            title="Move down"
            onClick={() => onMoveSlot(sectionKey, slotIndex, slotIndex + 1)}
            disabled={slotIndex === totalSlots - 1}
            className={cn(iconBtn, "!h-10 !w-10")}
          >
            <Arrow className="h-3.5 w-3.5 rotate-90" />
          </button>
        </div>

        {showImage ? (
          <div className="relative shrink-0">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt="" className="h-20 w-28 rounded-md border border-white/10 object-cover sm:h-20 sm:w-32" />
            ) : (
              <div className="flex h-20 w-28 items-center justify-center rounded-md border border-white/10 bg-white/[0.05] text-xs text-zinc-500 sm:w-32">
                No image
              </div>
            )}
            <span className="absolute left-1.5 top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-black/70 px-1 text-[0.65rem] font-medium text-white">
              {slotIndex + 1}
            </span>
          </div>
        ) : (
          <span className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-white/10 px-1 text-xs font-medium text-white">
            {slotIndex + 1}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-zinc-500">
            {category}
            {readTime && <span> &middot; {readTime}</span>}
          </p>
          <h3 className="mt-0.5 line-clamp-3 text-sm font-medium leading-snug text-white">{title}</h3>
          {author && <p className="mt-0.5 truncate text-xs text-zinc-400">By {author}</p>}
        </div>
      </div>

      <div className="sm:shrink-0">{actions}</div>
    </div>
  );
}
