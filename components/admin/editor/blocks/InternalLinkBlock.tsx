import { useState } from "react";
import { Btn, Label, TextInput } from "@/components/admin/ui";
import StoryPicker from "@/components/admin/StoryPicker";
import { resolveMediaUrl } from "@/lib/url-utils";
import EditorPickerSheet from "../EditorPickerSheet";
import { LIMITS } from "../limits";
import type { BlockFieldsProps } from "./types";

export default function InternalLinkBlock({ block, index, onUpdate }: BlockFieldsProps<"internal_link"> & { index: number }) {
  const [pickOpen, setPickOpen] = useState(false);
  return (
    <>
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
    </>
  );
}
