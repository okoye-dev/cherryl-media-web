import React, { useState } from "react";
import type { CanonicalArticle } from "@/lib/types";
import Arrow from "@/components/site/Arrow";
import { Btn } from "@/components/admin/ui";
import { cn } from "@/lib/cn";
import { formatCategoryName, formatReadTime, authorName, TEAM_BYLINE } from "@/lib/formatters";

interface SectionSlotCardProps {
  sectionKey: string;
  artId: string;
  slotIndex: number;
  totalSlots: number;
  layout: "feature" | "row";
  showImage: boolean;
  article?: CanonicalArticle;
  onMoveSlot: (sectionKey: string, fromIndex: number, toIndex: number) => void;
  onOpenPicker: (sectionKey: string, slotIndex: number) => void;
  onRemoveSlot: (sectionKey: string, slotIndex: number) => void;
}

function PencilButton({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 text-zinc-200 transition-colors group-hover:bg-white/[0.09] group-hover:text-white",
        open ? "bg-white/[0.12]" : "bg-white/[0.04]",
      )}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" />
      </svg>
    </span>
  );
}

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
  const feature = layout === "feature";
  const first = slotIndex === 0;
  const last = slotIndex === totalSlots - 1;

  const [open, setOpen] = useState(false);
  const trayId = `slot-${sectionKey}-${slotIndex}`;

  const picture = (cls: string, withNumber: boolean) => (
    <span className={cn("relative block shrink-0 overflow-hidden rounded-lg bg-[#1A1D24]", cls)}>
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-xs text-zinc-500">No image</span>
      )}
      {withNumber && (
        <span className="absolute left-1.5 top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-black/70 px-1 text-[0.65rem] font-medium text-white">
          {slotIndex + 1}
        </span>
      )}
    </span>
  );

  const tray = open && (
    <div id={trayId} className={cn("flex flex-wrap gap-2 pt-3", !feature && "pl-0")}>
      {!feature && (
        <>
          <Btn size="sm" className="!h-10" disabled={first} onClick={() => onMoveSlot(sectionKey, slotIndex, slotIndex - 1)}>
            <Arrow className="h-3 w-3 -rotate-90" />
            Up
          </Btn>
          <Btn size="sm" className="!h-10" disabled={last} onClick={() => onMoveSlot(sectionKey, slotIndex, slotIndex + 1)}>
            <Arrow className="h-3 w-3 rotate-90" />
            Down
          </Btn>
        </>
      )}
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
        Remove
      </Btn>
    </div>
  );

  const toggleProps = {
    type: "button" as const,
    "aria-expanded": open,
    "aria-controls": trayId,
    onClick: () => setOpen((o) => !o),
  };

  if (feature) {
    return (
      <div className="py-1">
        <button {...toggleProps} className="group block w-full text-left">
          {showImage && picture("aspect-[16/9] w-full", false)}
          <span className={cn("flex items-start gap-3", showImage && "mt-3")}>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-medium text-brand-red/90">{kicker || category}</span>
              <span className="mt-1 block text-lg font-medium leading-snug text-white">{title}</span>
              {deck && <span className="mt-1.5 line-clamp-3 block text-sm leading-relaxed text-zinc-300">{deck}</span>}
              <span className="mt-2 block text-xs text-zinc-400">
                By {author || TEAM_BYLINE}
                {readTime && <span> &middot; {readTime}</span>}
              </span>
            </span>
            <PencilButton open={open} />
          </span>
        </button>
        {tray}
      </div>
    );
  }

  return (
    <div className="py-3">
      <button {...toggleProps} className="group flex w-full items-start gap-3 text-left">
        {showImage ? (
          picture("h-16 w-16 sm:h-20 sm:w-28", true)
        ) : (
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-medium text-white">
            {slotIndex + 1}
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-xs text-zinc-500">
            {category}
            {readTime && <span> &middot; {readTime}</span>}
          </span>
          <span className="mt-0.5 line-clamp-3 block text-sm font-medium leading-snug text-white">{title}</span>
          {author && <span className="mt-0.5 block truncate text-xs text-zinc-400">By {author}</span>}
        </span>
        <PencilButton open={open} />
      </button>
      {tray}
    </div>
  );
}
