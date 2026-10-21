import EditorBlockItem from "./EditorBlockItem";
import { Panel } from "@/components/admin/ui";
import { PlusIcon } from "./icons";
import type { ContentBlock } from "@/lib/types";

interface EditorBlockListProps {
  blocks: ContentBlock[];
  onAddBlock: (block: ContentBlock, atIndex?: number) => void;
  onUpdateBlock: (index: number, updated: ContentBlock) => void;
  onMoveBlock: (index: number, direction: "up" | "down") => void;
  onRemoveBlock: (index: number) => void;
  onUploadStateChange: (isUploading: boolean) => void;
  isAiBlock?: (block: ContentBlock) => boolean;
}

const CHIP =
  "inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 text-xs font-medium transition-colors";
const CHIP_NEUTRAL = `${CHIP} border-white/10 bg-white/[0.04] text-zinc-200 hover:bg-white/[0.09] hover:text-white`;
const CHIP_ACCENT = `${CHIP} border-brand-red/40 bg-brand-red/10 text-red-200 hover:bg-brand-red/20`;

export default function EditorBlockList({
  blocks,
  onAddBlock,
  onUpdateBlock,
  onMoveBlock,
  onRemoveBlock,
  onUploadStateChange,
  isAiBlock,
}: EditorBlockListProps) {
  const chips: Array<{ label: string; accent?: boolean; make: () => ContentBlock }> = [
    { label: "Paragraph", make: () => ({ type: "paragraph", text: "", isDropCap: false }) },
    { label: "Heading", make: () => ({ type: "heading", level: 2, text: "" }) },
    {
      label: "Pull quote",
      make: () => ({ type: "quote", quote: "", author: "Speaker name", context: "Official title or institution" }),
    },
    {
      label: "Photo",
      make: () => ({ type: "image", src: "", alt: "Story photo", caption: "", credit: "Cherryl Media" }),
    },
    { label: "Video", make: () => ({ type: "video", src: "", caption: "", credit: "" }) },
    { label: "YouTube", make: () => ({ type: "youtube", url: "", caption: "" }) },
    {
      label: "Related story",
      accent: true,
      make: () => ({
        type: "internal_link",
        title: "Related Story Headline",
        slug: "nigeria-electricity-regulatory-commission-updates-feeder-bands",
        category: "STATE AFFAIRS & ENVIRONS",
        deck: "Brief sentence explaining context for reader.",
      }),
    },
    {
      label: "Source link",
      make: () => ({ type: "external_link", title: "Official Gazette Document", url: "https://", publisher: "Official Agency" }),
    },
  ];

  return (
    <div id="body-section" className="scroll-mt-24">
    <Panel
      title="Body"
      description="Blocks run top to bottom. Move them with the arrows."
      actions={<span className="text-xs text-zinc-500">{blocks.length} blocks</span>}
    >
      <div className="space-y-3">
        {blocks.map((block, index) => (
          <EditorBlockItem
            key={index}
            block={block}
            index={index}
            totalBlocks={blocks.length}
            onUpdate={(updated) => onUpdateBlock(index, updated)}
            onMoveUp={() => onMoveBlock(index, "up")}
            onMoveDown={() => onMoveBlock(index, "down")}
            onDelete={() => onRemoveBlock(index)}
            onUploadStateChange={onUploadStateChange}
            aiFilled={isAiBlock?.(block)}
          />
        ))}
      </div>

      <div className="mt-4 border-t border-white/[0.08] pt-4">
        <p className="mb-2 text-[0.7rem] font-medium text-zinc-400">Add a block</p>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:-mx-5 sm:px-5 md:mx-0 md:flex-wrap md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
          {chips.map((c) => (
            <button
              key={c.label}
              type="button"
              onClick={() => onAddBlock(c.make())}
              className={c.accent ? CHIP_ACCENT : CHIP_NEUTRAL}
            >
              <PlusIcon />
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </Panel>
    </div>
  );
}
