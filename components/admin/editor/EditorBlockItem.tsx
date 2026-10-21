import { AIChip } from "@/components/admin/ui";
import { cn } from "@/lib/cn";
import type { ContentBlock } from "@/lib/types";
import { ChevronDown, ChevronUp, TrashIcon } from "./icons";
import ParagraphBlock from "./blocks/ParagraphBlock";
import HeadingBlock from "./blocks/HeadingBlock";
import QuoteBlock from "./blocks/QuoteBlock";
import ImageBlock from "./blocks/ImageBlock";
import VideoBlock from "./blocks/VideoBlock";
import YouTubeBlock from "./blocks/YouTubeBlock";
import InternalLinkBlock from "./blocks/InternalLinkBlock";
import ExternalLinkBlock from "./blocks/ExternalLinkBlock";

const BLOCK_LABELS: Record<string, string> = {
  paragraph: "Paragraph",
  heading: "Subheading",
  quote: "Pull quote",
  image: "Photo",
  video: "Video file",
  youtube: "YouTube",
  internal_link: "Related story card",
  external_link: "Source link",
};

const ICON_BTN =
  "inline-flex h-10 w-10 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-400 sm:h-9 sm:w-9";

interface EditorBlockItemProps {
  block: ContentBlock;
  index: number;
  totalBlocks: number;
  onUpdate: (updated: ContentBlock) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onUploadStateChange: (isUploading: boolean) => void;
  aiFilled?: boolean;
}

export default function EditorBlockItem({
  block,
  index,
  totalBlocks,
  onUpdate,
  onMoveUp,
  onMoveDown,
  onDelete,
  onUploadStateChange,
  aiFilled,
}: EditorBlockItemProps) {
  return (
    <div className="space-y-3 rounded-xl border border-white/10 bg-[#1A1D24] p-3 sm:p-4">
      <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] pb-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 rounded bg-brand-red/15 px-1.5 py-0.5 text-[0.7rem] font-medium text-brand-red">
            {index + 1}
          </span>
          <span className="truncate text-xs font-medium text-zinc-300">{BLOCK_LABELS[block.type] ?? block.type}</span>
          {aiFilled && <AIChip />}
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          <button type="button" disabled={index === 0} onClick={onMoveUp} className={ICON_BTN} aria-label="Move block up" title="Move up">
            <ChevronUp />
          </button>
          <button
            type="button"
            disabled={index === totalBlocks - 1}
            onClick={onMoveDown}
            className={ICON_BTN}
            aria-label="Move block down"
            title="Move down"
          >
            <ChevronDown />
          </button>
          <button type="button" onClick={onDelete} className={cn(ICON_BTN, "hover:text-red-400")} aria-label="Delete block" title="Delete block">
            <TrashIcon />
          </button>
        </div>
      </div>

      {block.type === "paragraph" && <ParagraphBlock block={block} onUpdate={onUpdate} />}
      {block.type === "heading" && <HeadingBlock block={block} onUpdate={onUpdate} />}
      {block.type === "quote" && <QuoteBlock block={block} onUpdate={onUpdate} />}
      {block.type === "image" && <ImageBlock block={block} onUpdate={onUpdate} onUploadStateChange={onUploadStateChange} />}
      {block.type === "video" && <VideoBlock block={block} onUpdate={onUpdate} />}
      {block.type === "youtube" && <YouTubeBlock block={block} onUpdate={onUpdate} />}
      {block.type === "internal_link" && <InternalLinkBlock block={block} index={index} onUpdate={onUpdate} />}
      {block.type === "external_link" && <ExternalLinkBlock block={block} onUpdate={onUpdate} />}
    </div>
  );
}
