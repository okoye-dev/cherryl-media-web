import EditorBlockItem from "./EditorBlockItem";
import type { ContentBlock, CanonicalArticle } from "@/lib/types";

interface EditorBlockListProps {
  blocks: ContentBlock[];
  articlesList: CanonicalArticle[];
  onAddBlock: (block: ContentBlock, atIndex?: number) => void;
  onUpdateBlock: (index: number, updated: ContentBlock) => void;
  onMoveBlock: (index: number, direction: "up" | "down") => void;
  onRemoveBlock: (index: number) => void;
  onUploadStateChange: (isUploading: boolean) => void;
}

export default function EditorBlockList({
  blocks,
  articlesList,
  onAddBlock,
  onUpdateBlock,
  onMoveBlock,
  onRemoveBlock,
  onUploadStateChange,
}: EditorBlockListProps) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#16181D] p-5 sm:p-7 space-y-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.06] pb-3 gap-2">
        <div>
          <span className="text-[0.68rem] font-mono uppercase tracking-wider text-brand-red font-semibold block">
            ARTICLE BODY BLOCKS &amp; ORDERING
          </span>
          <p className="text-xs text-zinc-400 mt-0.5">
            Ordered sequential blocks. Insert media, quotes, and related post cards at any position.
          </p>
        </div>
        <span className="text-xs font-mono text-zinc-400">
          Total blocks: <strong>{blocks.length}</strong>
        </span>
      </div>

      {/* List of content blocks */}
      <div className="space-y-4">
        {blocks.map((block, index) => (
          <EditorBlockItem
            key={index}
            block={block}
            index={index}
            totalBlocks={blocks.length}
            articlesList={articlesList}
            onUpdate={(updated) => onUpdateBlock(index, updated)}
            onMoveUp={() => onMoveBlock(index, "up")}
            onMoveDown={() => onMoveBlock(index, "down")}
            onDelete={() => onRemoveBlock(index)}
            onUploadStateChange={onUploadStateChange}
          />
        ))}
      </div>

      {/* Action Bar: Add Any Block At End */}
      <div className="pt-4 border-t border-white/[0.08] space-y-2">
        <span className="text-[0.68rem] font-mono uppercase tracking-wider text-zinc-400 block">
          + Add Content Block (appends with explicit Order ID #{blocks.length + 1})
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onAddBlock({ type: "paragraph", text: "", isDropCap: false })}
            className="rounded-lg border border-white/15 bg-[#1A1D24] px-3.5 py-2 text-xs font-medium text-white hover:bg-zinc-800 transition-colors"
          >
            + Paragraph
          </button>
          <button
            type="button"
            onClick={() => onAddBlock({ type: "heading", level: 2, text: "" })}
            className="rounded-lg border border-white/15 bg-[#1A1D24] px-3.5 py-2 text-xs font-medium text-white hover:bg-zinc-800 transition-colors"
          >
            + Heading
          </button>
          <button
            type="button"
            onClick={() =>
              onAddBlock({
                type: "quote",
                quote: "",
                author: "Speaker name",
                context: "Official title or institution",
              })
            }
            className="rounded-lg border border-white/15 bg-[#1A1D24] px-3.5 py-2 text-xs font-medium text-white hover:bg-zinc-800 transition-colors"
          >
            + Pull Quote
          </button>
          <button
            type="button"
            onClick={() =>
              onAddBlock({
                type: "image",
                src: "",
                alt: "Story photo",
                caption: "",
                credit: "Cherryl Media",
              })
            }
            className="rounded-lg border border-white/15 bg-[#1A1D24] px-3.5 py-2 text-xs font-medium text-white hover:bg-zinc-800 transition-colors"
          >
            + Photo (Media)
          </button>
          <button
            type="button"
            onClick={() =>
              onAddBlock({
                type: "video",
                src: "",
                caption: "",
                credit: "",
              })
            }
            className="rounded-lg border border-white/15 bg-[#1A1D24] px-3.5 py-2 text-xs font-medium text-white hover:bg-zinc-800 transition-colors"
          >
            + Video Player
          </button>
          <button
            type="button"
            onClick={() =>
              onAddBlock({
                type: "youtube",
                url: "",
                caption: "",
              })
            }
            className="rounded-lg border border-white/15 bg-[#1A1D24] px-3.5 py-2 text-xs font-medium text-white hover:bg-zinc-800 transition-colors"
          >
            + YouTube
          </button>
          <button
            type="button"
            onClick={() =>
              onAddBlock({
                type: "internal_link",
                title: "Related Story Headline",
                slug: "nigeria-electricity-regulatory-commission-updates-feeder-bands",
                category: "STATE AFFAIRS & ENVIRONS",
                deck: "Brief sentence explaining context for reader.",
              })
            }
            className="rounded-lg border border-brand-red/40 bg-brand-red/10 px-3.5 py-2 text-xs font-semibold text-brand-red hover:bg-brand-red/20 transition-colors"
          >
            + Link Related Post
          </button>
          <button
            type="button"
            onClick={() =>
              onAddBlock({
                type: "external_link",
                title: "Official Gazette Document",
                url: "https://",
                publisher: "Official Agency",
              })
            }
            className="rounded-lg border border-white/15 bg-[#1A1D24] px-3.5 py-2 text-xs font-medium text-white hover:bg-zinc-800 transition-colors"
          >
            + External Link
          </button>
        </div>
      </div>
    </div>
  );
}
