import { useRef } from "react";
import { useTagSearch } from "@/hooks/useTagSearch";
import { AIChip, Btn, Label, TextInput } from "@/components/admin/ui";
import { LIMITS } from "./limits";
import { CloseIcon, PlusIcon } from "./icons";

interface EditorTagsProps {
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  aiFilled?: boolean;
}

/** The tags field. It has no card of its own: it sits inside the Details panel. */
export default function EditorTags({ tags, onAddTag, onRemoveTag, aiFilled }: EditorTagsProps) {
  const { tagInput, setTagInput, suggestions, isOpen, setIsOpen, addTag } = useTagSearch(tags, onAddTag);
  const containerRef = useRef<HTMLDivElement>(null);
  const full = tags.length >= LIMITS.maxTags;

  return (
    <div>
      <Label htmlFor="story-tags" hint={`${tags.length} of ${LIMITS.maxTags}`}>
        Tags {aiFilled && <AIChip className="ml-1" />}
      </Label>

      {tags.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex h-10 max-w-full items-center rounded-full border border-white/15 bg-white/[0.05] pl-3 text-xs text-zinc-200"
            >
              <span className="truncate">{tag}</span>
              <button
                type="button"
                onClick={() => onRemoveTag(tag)}
                className="ml-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-zinc-400 hover:text-red-400"
                aria-label={`Remove tag ${tag}`}
              >
                <CloseIcon />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative" ref={containerRef}>
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <TextInput
              id="story-tags"
              value={tagInput}
              maxLength={LIMITS.tag}
              disabled={full}
              onChange={(e) => setTagInput(e.target.value.replace(/#/g, ""))}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  if (tagInput.trim() && !full) addTag(tagInput);
                }
              }}
              placeholder={full ? "Tag limit reached" : "Search or type a tag"}
            />
          </div>
          <Btn
            disabled={full}
            onClick={() => {
              if (tagInput.trim() && !full) addTag(tagInput);
            }}
          >
            <PlusIcon />
            Add
          </Btn>
        </div>

        {full && <p className="mt-1.5 text-xs text-amber-300">You can add up to {LIMITS.maxTags} tags. Remove one to add another.</p>}

        {isOpen && !full && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 z-30 mt-1.5 max-h-56 overflow-y-auto rounded-xl border border-white/15 bg-[#1A1D24] p-2 shadow-2xl">
            <div className="flex items-center justify-between gap-2 px-1">
              <span className="text-xs text-zinc-400">Matching tags</span>
              <Btn variant="ghost" size="sm" className="!h-10" onClick={() => setIsOpen(false)}>
                Close
              </Btn>
            </div>
            <div className="flex flex-wrap gap-2 p-1">
              {suggestions.slice(0, 8).map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => addTag(sug)}
                  className="h-10 rounded-lg border border-white/10 bg-zinc-900 px-3 text-xs text-zinc-300 transition-colors hover:bg-brand-red hover:text-white"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
