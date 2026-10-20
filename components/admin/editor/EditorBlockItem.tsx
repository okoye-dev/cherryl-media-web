import AutoTextarea from "@/components/admin/AutoTextarea";
import ImageUploadField from "@/components/admin/ImageUploadField";
import type { ContentBlock, CanonicalArticle } from "@/lib/types";
import { getYouTubeEmbedUrl, resolveMediaUrl } from "@/lib/url-utils";
import { uploadMediaFile } from "@/services/media";

interface EditorBlockItemProps {
  block: ContentBlock;
  index: number;
  totalBlocks: number;
  articlesList: CanonicalArticle[];
  onUpdate: (updated: ContentBlock) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onUploadStateChange: (isUploading: boolean) => void;
}

export default function EditorBlockItem({
  block,
  index,
  totalBlocks,
  articlesList,
  onUpdate,
  onMoveUp,
  onMoveDown,
  onDelete,
  onUploadStateChange,
}: EditorBlockItemProps) {
  return (
    <div className="relative group rounded-xl border border-white/10 bg-[#1A1D24] p-4 transition-all hover:border-white/20 space-y-3">
      {/* Block Header with Ordering ID and Reordering Actions */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <span className="rounded bg-brand-red/20 text-brand-red border border-brand-red/30 px-2 py-0.5 font-mono text-[0.68rem] font-bold">
            ORDER #{block.order_id || index + 1}
          </span>
          <span className="text-[0.68rem] font-mono font-semibold uppercase tracking-wider text-zinc-300">
            {block.type === "paragraph" && "Paragraph Text"}
            {block.type === "heading" && "Section Subheading"}
            {block.type === "quote" && "Pull Quote / Statement"}
            {block.type === "image" && "Story Photograph (Media)"}
            {block.type === "video" && "Video Player (MP4 Upload)"}
            {block.type === "youtube" && "YouTube Embed"}
            {block.type === "internal_link" && "Linked Related Post (Internal Card)"}
            {block.type === "external_link" && "External Source Card"}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={index === 0}
            onClick={onMoveUp}
            className="rounded p-1 text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"
            title="Move Up in order"
          >
            ▲
          </button>
          <button
            type="button"
            disabled={index === totalBlocks - 1}
            onClick={onMoveDown}
            className="rounded p-1 text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"
            title="Move Down in order"
          >
            ▼
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="text-xs text-zinc-500 hover:text-red-400 transition-colors ml-2"
            title="Delete block"
          >
            Delete
          </button>
        </div>
      </div>

      {/* 1. Paragraph */}
      {block.type === "paragraph" && (
        <div className="space-y-2">
          <AutoTextarea
            value={block.text || ""}
            onChange={(e) => onUpdate({ ...block, text: e.target.value })}
            placeholder="Write paragraph text..."
            className="text-base text-zinc-100 placeholder-zinc-500 bg-transparent leading-relaxed focus:outline-none"
          />
          <label className="flex items-center gap-2 pt-2 text-xs text-zinc-400 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(block.isDropCap)}
              onChange={(e) => onUpdate({ ...block, isDropCap: e.target.checked })}
              className="rounded border-zinc-700 bg-zinc-900 text-brand-red focus:ring-0"
            />
            Use large lead drop cap
          </label>
        </div>
      )}

      {/* 2. Heading */}
      {block.type === "heading" && (
        <div className="space-y-2">
          <AutoTextarea
            value={block.text || ""}
            onChange={(e) => onUpdate({ ...block, text: e.target.value })}
            placeholder="Enter section subheading..."
            className="font-sans text-lg font-semibold text-white placeholder-zinc-500 bg-transparent tracking-tight focus:outline-none"
          />
          <div className="flex items-center gap-3 text-xs text-zinc-400">
            <span>Heading Level:</span>
            <label className="inline-flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name={`heading-level-${index}`}
                checked={block.level !== 3}
                onChange={() => onUpdate({ ...block, level: 2 })}
                className="text-brand-red focus:ring-0"
              />
              <span>H2 (Major Section)</span>
            </label>
            <label className="inline-flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name={`heading-level-${index}`}
                checked={block.level === 3}
                onChange={() => onUpdate({ ...block, level: 3 })}
                className="text-brand-red focus:ring-0"
              />
              <span>H3 (Minor Subsection)</span>
            </label>
          </div>
        </div>
      )}

      {/* 3. Quote */}
      {block.type === "quote" && (
        <div className="space-y-3">
          <AutoTextarea
            value={block.quote || ""}
            onChange={(e) => onUpdate({ ...block, quote: e.target.value })}
            placeholder="Enter direct statement or pull quote..."
            className="font-sans text-lg italic text-zinc-100 placeholder-zinc-500 bg-transparent leading-snug focus:outline-none border-l-2 border-brand-red pl-4"
          />
          <div className="grid gap-3 sm:grid-cols-2 pt-2">
            <input
              type="text"
              value={block.author || ""}
              onChange={(e) => onUpdate({ ...block, author: e.target.value })}
              placeholder="Speaker name"
              className="h-10 rounded-lg border border-white/10 bg-[#141519] px-3 text-xs text-white focus:border-brand-red focus:outline-none"
            />
            <input
              type="text"
              value={block.context || ""}
              onChange={(e) => onUpdate({ ...block, context: e.target.value })}
              placeholder="Official title or institution"
              className="h-10 rounded-lg border border-white/10 bg-[#141519] px-3 text-xs text-white focus:border-brand-red focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* 4. Story Photograph (Media) */}
      {block.type === "image" && (
        <div className="space-y-3">
          <ImageUploadField
            label="Inline Photo"
            value={block.src || ""}
            onChange={(url) => onUpdate({ ...block, src: url })}
            onUploadStateChange={onUploadStateChange}
            description="Supporting photograph placed between paragraphs."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              value={block.caption || ""}
              onChange={(e) => onUpdate({ ...block, caption: e.target.value })}
              placeholder="Photo caption..."
              className="h-10 rounded-lg border border-white/10 bg-[#141519] px-3 text-xs text-white focus:border-brand-red focus:outline-none"
            />
            <input
              type="text"
              value={block.credit || ""}
              onChange={(e) => onUpdate({ ...block, credit: e.target.value })}
              placeholder="Photo credit..."
              className="h-10 rounded-lg border border-white/10 bg-[#141519] px-3 text-xs text-white focus:border-brand-red focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* 5. Video Player (Media) */}
      {block.type === "video" && (
        <div className="space-y-3">
          <div>
            <label className="block text-[0.7rem] font-medium text-zinc-300 mb-1">
              Video Source URL (or MP4/WebM)
            </label>
            <input
              type="text"
              value={block.src || ""}
              onChange={(e) => onUpdate({ ...block, src: e.target.value })}
              placeholder="https://... or /uploads/video.mp4"
              className="h-10 w-full rounded-lg border border-white/10 bg-[#141519] px-3 text-xs font-mono text-zinc-200 focus:border-brand-red focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 transition-colors">
              <svg className="w-3.5 h-3.5 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <span>Upload Video File (Max 100MB)</span>
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const url = await uploadMediaFile(file);
                    if (url) onUpdate({ ...block, src: url });
                  } catch (err: unknown) {
                    const msg = err instanceof Error ? err.message : "Video upload failed";
                    alert(msg);
                  }
                }}
              />
            </label>
          </div>

          {block.src && (
            <div className="w-full aspect-video rounded-xl overflow-hidden bg-black border border-white/10">
              <video src={block.src} controls className="h-full w-full object-cover" />
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              value={block.caption || ""}
              onChange={(e) => onUpdate({ ...block, caption: e.target.value })}
              placeholder="Video caption..."
              className="h-10 rounded-lg border border-white/10 bg-[#141519] px-3 text-xs text-white focus:border-brand-red focus:outline-none"
            />
            <input
              type="text"
              value={block.credit || ""}
              onChange={(e) => onUpdate({ ...block, credit: e.target.value })}
              placeholder="Video credit..."
              className="h-10 rounded-lg border border-white/10 bg-[#141519] px-3 text-xs text-white focus:border-brand-red focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* 6. YouTube Embed (Media) */}
      {block.type === "youtube" && (
        <div className="space-y-3">
          <div>
            <label className="block text-[0.7rem] font-medium text-zinc-300 mb-1">
              YouTube Video URL or ID
            </label>
            <input
              type="text"
              value={block.url || ""}
              onChange={(e) => onUpdate({ ...block, url: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
              className="h-10 w-full rounded-lg border border-white/10 bg-[#141519] px-3 text-xs font-mono text-zinc-200 focus:border-brand-red focus:outline-none"
            />
          </div>

          {block.url && getYouTubeEmbedUrl(block.url) && (
            <div className="w-full aspect-video rounded-xl overflow-hidden bg-black border border-white/10 shadow-sm">
              <iframe
                src={getYouTubeEmbedUrl(block.url)!}
                title="YouTube Preview"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full border-0"
              />
            </div>
          )}

          <input
            type="text"
            value={block.caption || ""}
            onChange={(e) => onUpdate({ ...block, caption: e.target.value })}
            placeholder="Video caption / summary..."
            className="h-10 w-full rounded-lg border border-white/10 bg-[#141519] px-3 text-xs text-white focus:border-brand-red focus:outline-none"
          />
        </div>
      )}

      {/* 7. Link Related Post */}
      {block.type === "internal_link" && (
        <div className="space-y-3 rounded-xl border border-brand-red/30 bg-brand-red/5 p-4">
          <div className="flex items-center justify-between pb-2 border-b border-brand-red/20">
            <span className="text-xs font-semibold text-brand-red uppercase">
              🔗 Inline Related Post Card
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[0.65rem] text-zinc-400">Quick select:</span>
              <select
                onChange={(e) => {
                  const match = articlesList.find((a) => a.slug === e.target.value);
                  if (match) {
                    onUpdate({
                      type: "internal_link",
                      order_id: index + 1,
                      title: match.title,
                      slug: match.slug,
                      category: match.categoryName || match.category,
                      deck: match.excerpt || match.deck,
                      imageUrl: match.featuredImage?.url,
                    });
                  }
                }}
                className="rounded-lg border border-white/10 bg-zinc-900 px-2 py-1 text-[0.7rem] text-white focus:outline-none max-w-[200px] truncate"
              >
                <option value="">Choose published article...</option>
                {articlesList.map((a) => (
                  <option key={a.slug} value={a.slug}>
                    {a.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[0.68rem] font-semibold uppercase text-zinc-300 mb-1">
                Story Headline
              </label>
              <input
                type="text"
                value={block.title || ""}
                onChange={(e) => onUpdate({ ...block, title: e.target.value })}
                placeholder="Headline of related story..."
                className="h-10 w-full rounded-lg border border-white/10 bg-[#141519] px-3 text-xs font-semibold text-white focus:border-brand-red focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[0.68rem] font-semibold uppercase text-zinc-300 mb-1">
                Story Slug
              </label>
              <input
                type="text"
                value={block.slug || ""}
                onChange={(e) => onUpdate({ ...block, slug: e.target.value })}
                placeholder="e.g. nigeria-clean-energy-transition-report"
                className="h-10 w-full rounded-lg border border-white/10 bg-[#141519] px-3 text-xs font-mono text-zinc-200 focus:border-brand-red focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[0.68rem] font-semibold uppercase text-zinc-300 mb-1">
                Category Label
              </label>
              <input
                type="text"
                value={block.category || ""}
                onChange={(e) => onUpdate({ ...block, category: e.target.value })}
                placeholder="e.g. STATE AFFAIRS & ENVIRONS"
                className="h-10 w-full rounded-lg border border-white/10 bg-[#141519] px-3 text-xs text-zinc-300 focus:border-brand-red focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[0.68rem] font-semibold uppercase text-zinc-300 mb-1">
                Thumbnail Image URL
              </label>
              <input
                type="text"
                value={block.imageUrl || ""}
                onChange={(e) => onUpdate({ ...block, imageUrl: e.target.value })}
                placeholder="https://... or /uploads/..."
                className="h-10 w-full rounded-lg border border-white/10 bg-[#141519] px-3 text-xs font-mono text-zinc-300 focus:border-brand-red focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[0.68rem] font-semibold uppercase text-zinc-300 mb-1">
              Brief Reason to Read / Excerpt
            </label>
            <input
              type="text"
              value={block.deck || ""}
              onChange={(e) => onUpdate({ ...block, deck: e.target.value })}
              placeholder="Brief 1-sentence synopsis of why reader should click..."
              className="h-10 w-full rounded-lg border border-white/10 bg-[#141519] px-3 text-xs text-zinc-300 focus:border-brand-red focus:outline-none"
            />
          </div>

          {/* Internal Post Card Preview */}
          <div className="mt-2 rounded-xl border border-white/10 bg-zinc-900/80 p-3.5 flex items-center justify-between">
            <div className="min-w-0 pr-3">
              <span className="text-[0.62rem] font-bold uppercase tracking-wider text-brand-red">
                RELATED STORY · {block.category || "RECOMMENDED"}
              </span>
              <h4 className="font-semibold text-xs md:text-sm text-white line-clamp-1 mt-0.5">
                {block.title || "Related Story Headline Preview"}
              </h4>
              {block.deck && (
                <p className="text-[0.72rem] text-zinc-400 line-clamp-1 mt-0.5">{block.deck}</p>
              )}
            </div>
            {block.imageUrl && (
              <div className="h-12 w-20 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={resolveMediaUrl(block.imageUrl)} alt="" className="h-full w-full object-cover" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* 8. External Source Link */}
      {block.type === "external_link" && (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              value={block.title || ""}
              onChange={(e) => onUpdate({ ...block, title: e.target.value })}
              placeholder="Source title or report headline..."
              className="h-10 w-full rounded-lg border border-white/10 bg-[#141519] px-3 text-xs font-semibold text-white focus:border-brand-red focus:outline-none"
            />
            <input
              type="text"
              value={block.publisher || ""}
              onChange={(e) => onUpdate({ ...block, publisher: e.target.value })}
              placeholder="Publisher / Official Gazette..."
              className="h-10 w-full rounded-lg border border-white/10 bg-[#141519] px-3 text-xs text-zinc-300 focus:border-brand-red focus:outline-none"
            />
          </div>
          <input
            type="text"
            value={block.url || ""}
            onChange={(e) => onUpdate({ ...block, url: e.target.value })}
            placeholder="https://..."
            className="h-10 w-full rounded-lg border border-white/10 bg-[#141519] px-3 text-xs font-mono text-zinc-300 focus:border-brand-red focus:outline-none"
          />
        </div>
      )}
    </div>
  );
}
