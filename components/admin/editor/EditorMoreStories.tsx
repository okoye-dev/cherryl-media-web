import { useState } from "react";
import StoryPicker from "@/components/admin/StoryPicker";
import EditorPickerSheet from "./EditorPickerSheet";
import { Btn, Label, Panel, TextInput } from "@/components/admin/ui";
import { LIMITS } from "./limits";
import { PlusIcon, TrashIcon } from "./icons";
import type { RelatedStory } from "@/lib/types";

interface EditorMoreStoriesProps {
  relatedStories: RelatedStory[];
  onAddRelatedStory: (story: RelatedStory) => void;
  onUpdateRelatedStory: (index: number, updated: Partial<RelatedStory>) => void;
  onRemoveRelatedStory: (index: number) => void;
}

export default function EditorMoreStories({
  relatedStories,
  onAddRelatedStory,
  onUpdateRelatedStory,
  onRemoveRelatedStory,
}: EditorMoreStoriesProps) {
  const [pickIdx, setPickIdx] = useState<number | null>(null);
  return (
    <Panel
      title="Related stories"
      description="Cards shown at the end of the article."
      actions={
        <Btn
          block
          onClick={() =>
            onAddRelatedStory({
              type: "internal_link",
              title: "Related story recommendation",
              slug: "",
              category: "NEWSBEAT",
              deck: "Brief preview snippet for more stories card.",
              imageUrl: "",
            })
          }
        >
          <PlusIcon />
          Add story card
        </Btn>
      }
    >
      {relatedStories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-zinc-500">
          No related stories yet.
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {relatedStories.map((story, rIdx) => (
            <div key={rIdx} className="space-y-3 rounded-xl border border-white/10 bg-[#1A1D24] p-3 sm:p-4">
              <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] pb-2">
                <span className="text-xs font-medium text-zinc-300">Card {rIdx + 1}</span>
                <button
                  type="button"
                  onClick={() => onRemoveRelatedStory(rIdx)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-red-400 sm:h-9 sm:w-9"
                  aria-label={`Remove card ${rIdx + 1}`}
                  title="Remove card"
                >
                  <TrashIcon />
                </button>
              </div>

              <Btn block onClick={() => setPickIdx(rIdx)}>
                Fill from a published story
              </Btn>

              <div>
                <Label>Title</Label>
                <TextInput
                  value={story.title || ""}
                  onChange={(e) => onUpdateRelatedStory(rIdx, { title: e.target.value })}
                  maxLength={LIMITS.relatedTitle}
                  placeholder="Story title"
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <div>
                  <Label>Slug or link</Label>
                  <TextInput
                    value={story.slug || story.url || ""}
                    onChange={(e) => onUpdateRelatedStory(rIdx, { slug: e.target.value, url: e.target.value })}
                    placeholder="story-slug or https://..."
                    className="font-mono"
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <TextInput
                    value={story.category || ""}
                    onChange={(e) => onUpdateRelatedStory(rIdx, { category: e.target.value })}
                    placeholder="e.g. Newsbeat"
                  />
                </div>
              </div>

              <div>
                <Label>Thumbnail URL</Label>
                <TextInput
                  value={story.imageUrl || ""}
                  onChange={(e) => onUpdateRelatedStory(rIdx, { imageUrl: e.target.value })}
                  placeholder="https://... or /uploads/..."
                  className="font-mono"
                />
              </div>

              <div>
                <Label>Short summary</Label>
                <TextInput
                  value={story.deck || ""}
                  onChange={(e) => onUpdateRelatedStory(rIdx, { deck: e.target.value })}
                  maxLength={LIMITS.excerpt}
                  placeholder="One line for the card"
                />
              </div>
            </div>
          ))}
        </div>
      )}
      <EditorPickerSheet open={pickIdx !== null} title="Choose a published story" onClose={() => setPickIdx(null)}>
        <StoryPicker
          status="published"
          onPick={(match) => {
            if (pickIdx !== null) {
              onUpdateRelatedStory(pickIdx, {
                title: match.title,
                slug: match.slug,
                category: match.categoryName || match.category,
                deck: match.excerpt || match.deck,
                imageUrl: match.featuredImage?.url,
              });
            }
            setPickIdx(null);
          }}
        />
      </EditorPickerSheet>
    </Panel>
  );
}
