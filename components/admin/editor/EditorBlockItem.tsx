import { useState } from "react";
import { AIChip, Btn, Label, Switch, TextInput } from "@/components/admin/ui";
import { LIMITS } from "./limits";
import { cn } from "@/lib/cn";
import { ChevronDown, ChevronUp, TrashIcon } from "./icons";
import ImageUploadField from "@/components/admin/ImageUploadField";
import type { ContentBlock } from "@/lib/types";
import StoryPicker from "@/components/admin/StoryPicker";
import EditorPickerSheet from "./EditorPickerSheet";
import { getYouTubeEmbedUrl, resolveMediaUrl } from "@/lib/url-utils";
import { uploadMediaFile } from "@/lib/upload";

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
  const [pickOpen, setPickOpen] = useState(false);
  return (
    <div className="space-y-3 rounded-xl border border-white/10 bg-[#1A1D24] p-3 sm:p-4">
      {/* Block header: type on the left, move and delete on the right. Never wider than a phone. */}
      <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] pb-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 rounded bg-brand-red/15 px-1.5 py-0.5 text-[0.7rem] font-medium text-brand-red">
            {index + 1}
          </span>
          <span className="truncate text-xs font-medium text-zinc-300">{BLOCK_LABELS[block.type] ?? block.type}</span>
          {aiFilled && <AIChip />}
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            disabled={index === 0}
            onClick={onMoveUp}
            className={ICON_BTN}
            aria-label="Move block up"
            title="Move up"
          >
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
          <button
            type="button"
            onClick={onDelete}
            className={cn(ICON_BTN, "hover:text-red-400")}
            aria-label="Delete block"
            title="Delete block"
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      {/* 1. Paragraph */}
      {block.type === "paragraph" && (
        <div className="space-y-2">
          <TextInput
            multiline
            value={block.text || ""}
            onChange={(e) => onUpdate({ ...block, text: e.target.value })}
            placeholder="Write paragraph text"
            className="leading-relaxed"
            data-block-field
          />
          <Switch
            checked={Boolean(block.isDropCap)}
            onChange={(on) => onUpdate({ ...block, isDropCap: on })}
            label="Large drop cap"
            description="Makes the first letter big"
          />
        </div>
      )}

      {/* 2. Heading */}
      {block.type === "heading" && (
        <div className="space-y-2">
          <TextInput
            value={block.text || ""}
            maxLength={LIMITS.heading}
            onChange={(e) => onUpdate({ ...block, text: e.target.value })}
            placeholder="Enter section subheading"
            className="text-lg font-semibold tracking-tight"
          />
          <div className="flex items-center gap-2 text-sm text-zinc-400" role="group" aria-label="Heading level">
            <span className="mr-1">Level</span>
            {([2, 3] as const).map((lv) => (
              <button
                key={lv}
                type="button"
                aria-pressed={(block.level === 3 ? 3 : 2) === lv}
                onClick={() => onUpdate({ ...block, level: lv })}
                className={cn(
                  "h-10 rounded-lg border px-3.5 text-xs font-medium transition-colors",
                  (block.level === 3 ? 3 : 2) === lv
                    ? "border-brand-red bg-brand-red/15 text-white"
                    : "border-white/10 text-zinc-400 hover:bg-white/[0.06] hover:text-white",
                )}
              >
                {lv === 2 ? "H2 main" : "H3 sub"}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Quote */}
      {block.type === "quote" && (
        <div className="space-y-3">
          <TextInput
            multiline
            value={block.quote || ""}
            maxLength={LIMITS.quote}
            onChange={(e) => onUpdate({ ...block, quote: e.target.value })}
            placeholder="Enter the quote"
            className="border-l-2 !border-l-brand-red text-lg italic"
          />
          <div className="grid gap-3 md:grid-cols-2">
            <TextInput
              value={block.author || ""}
              onChange={(e) => onUpdate({ ...block, author: e.target.value })}
              placeholder="Speaker name"
            />
            <TextInput
              value={block.context || ""}
              onChange={(e) => onUpdate({ ...block, context: e.target.value })}
              placeholder="Official title or institution"
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
          <div className="grid gap-3 md:grid-cols-2">
            <TextInput
              value={block.caption || ""}
              onChange={(e) => onUpdate({ ...block, caption: e.target.value })}
              maxLength={LIMITS.imageCaption}
              placeholder="Photo caption..."
            />
            <TextInput
              value={block.credit || ""}
              onChange={(e) => onUpdate({ ...block, credit: e.target.value })}
              placeholder="Photo credit..."
            />
          </div>
        </div>
      )}

      {/* 5. Video Player (Media) */}
      {block.type === "video" && (
        <div className="space-y-3">
          <div>
            <Label>Video URL</Label>
            <TextInput
              value={block.src || ""}
              onChange={(e) => onUpdate({ ...block, src: e.target.value })}
              placeholder="https://... or /uploads/video.mp4"
              className="font-mono"
            />
          </div>

          <div>
            <label className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/[0.09] hover:text-white sm:h-10 sm:w-auto sm:text-[0.8rem]">
              <svg className="w-3.5 h-3.5 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <span>Upload video (max 100MB)</span>
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

          <div className="grid gap-3 md:grid-cols-2">
            <TextInput
              value={block.caption || ""}
              onChange={(e) => onUpdate({ ...block, caption: e.target.value })}
              maxLength={LIMITS.imageCaption}
              placeholder="Video caption..."
            />
            <TextInput
              value={block.credit || ""}
              onChange={(e) => onUpdate({ ...block, credit: e.target.value })}
              placeholder="Video credit..."
            />
          </div>
        </div>
      )}

      {/* 6. YouTube Embed (Media) */}
      {block.type === "youtube" && (
        <div className="space-y-3">
          <div>
            <Label>YouTube link or ID</Label>
            <TextInput
              value={block.url || ""}
              onChange={(e) => onUpdate({ ...block, url: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
              className="font-mono"
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

          <TextInput
            value={block.caption || ""}
            onChange={(e) => onUpdate({ ...block, caption: e.target.value })}
            maxLength={LIMITS.imageCaption}
              placeholder="Video caption / summary..."
          />
        </div>
      )}

      {/* 7. Link Related Post */}
      {block.type === "internal_link" && (
        <div className="space-y-3 rounded-xl border border-brand-red/30 bg-brand-red/5 p-3 sm:p-4">
          <div className="flex flex-col gap-2 border-b border-brand-red/20 pb-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs font-medium text-brand-red">Pick a published story to fill this in</span>
            <Btn onClick={() => setPickOpen(true)} className="sm:shrink-0">
              Choose a story
            </Btn>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Label>Headline</Label>
              <TextInput
                value={block.title || ""}
                onChange={(e) => onUpdate({ ...block, title: e.target.value })}
                maxLength={LIMITS.relatedTitle}
                placeholder="Headline of related story..."
              />
            </div>
            <div>
              <Label>Slug</Label>
              <TextInput
                value={block.slug || ""}
                onChange={(e) => onUpdate({ ...block, slug: e.target.value })}
                placeholder="e.g. nigeria-clean-energy-transition-report"
                className="font-mono"
              />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Label>Category</Label>
              <TextInput
                value={block.category || ""}
                onChange={(e) => onUpdate({ ...block, category: e.target.value })}
                placeholder="e.g. STATE AFFAIRS & ENVIRONS"
              />
            </div>
            <div>
              <Label>Thumbnail URL</Label>
              <TextInput
                value={block.imageUrl || ""}
                onChange={(e) => onUpdate({ ...block, imageUrl: e.target.value })}
                placeholder="https://... or /uploads/..."
                className="font-mono"
              />
            </div>
          </div>

          <div>
            <Label>Short summary</Label>
            <TextInput
              value={block.deck || ""}
              onChange={(e) => onUpdate({ ...block, deck: e.target.value })}
              maxLength={LIMITS.excerpt}
                placeholder="Brief 1-sentence synopsis of why reader should click..."
            />
          </div>

          {/* Internal Post Card Preview */}
          <div className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-zinc-900/80 p-3">
            <div className="min-w-0 pr-3">
              <span className="text-xs font-medium text-brand-red">
                Related story, {block.category || "recommended"}
              </span>
              <h4 className="text-sm font-semibold text-white line-clamp-1 mt-0.5">
                {block.title || "Related Story Headline Preview"}
              </h4>
              {block.deck && (
                <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">{block.deck}</p>
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
          <div className="grid gap-3 md:grid-cols-2">
            <TextInput
              value={block.title || ""}
              onChange={(e) => onUpdate({ ...block, title: e.target.value })}
              placeholder="Source title or report headline..."
            />
            <TextInput
              value={block.publisher || ""}
              onChange={(e) => onUpdate({ ...block, publisher: e.target.value })}
              placeholder="Publisher / Official Gazette..."
            />
          </div>
          <TextInput
            value={block.url || ""}
            onChange={(e) => onUpdate({ ...block, url: e.target.value })}
            placeholder="https://..."
            className="font-mono"
          />
        </div>
      )}

      <EditorPickerSheet open={pickOpen} title="Choose a published story" onClose={() => setPickOpen(false)}>
        <StoryPicker
          status="published"
          onPick={(match) => {
            setPickOpen(false);
            onUpdate({
              type: "internal_link",
              order_id: index + 1,
              id: block.id,
              title: match.title,
              slug: match.slug,
              category: match.categoryName || match.category,
              deck: match.excerpt || match.deck,
              imageUrl: match.featuredImage?.url,
            });
          }}
        />
      </EditorPickerSheet>
    </div>
  );
}
