import { useRef } from "react";
import { useTagSearch } from "@/hooks/useTagSearch";

interface EditorTagsProps {
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}

export default function EditorTags({ tags, onAddTag, onRemoveTag }: EditorTagsProps) {
  const { tagInput, setTagInput, suggestions, isOpen, setIsOpen, addTag } = useTagSearch(tags, onAddTag);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#16181D] p-5 sm:p-7 space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
        <span className="text-[0.68rem] font-mono uppercase tracking-wider text-brand-red font-semibold">
          TAGS &amp; KEYWORDS
        </span>
        <span className="text-[0.68rem] text-zinc-500 font-mono">{tags.length} tags attached</span>
      </div>

      {/* Tag Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 rounded-full bg-zinc-800 border border-white/15 px-3 py-1 text-xs font-mono text-zinc-200"
          >
            <span>#{tag}</span>
            <button
              type="button"
              onClick={() => onRemoveTag(tag)}
              className="text-zinc-400 hover:text-red-400 transition-colors font-bold text-xs"
              title={`Remove tag ${tag}`}
            >
              ✕
            </button>
          </span>
        ))}
      </div>

      {/* Tag Search Input & Autocomplete Dropdown */}
      <div className="relative" ref={containerRef}>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                if (tagInput.trim()) addTag(tagInput);
              }
            }}
            placeholder="Search existing tags or type new tag and press Enter..."
            className="h-10 flex-1 rounded-xl border border-white/10 bg-[#1A1D24] px-3.5 text-xs text-white focus:border-brand-red focus:outline-none"
          />
          <button
            type="button"
            onClick={() => {
              if (tagInput.trim()) addTag(tagInput);
            }}
            className="rounded-xl border border-white/10 bg-zinc-800 hover:bg-zinc-700 px-3 py-2 text-xs text-white transition-colors"
          >
            + Add Tag
          </button>
        </div>

        {/* Suggestions Dropdown */}
        {isOpen && suggestions.length > 0 && (
          <div className="absolute z-30 left-0 right-0 mt-1.5 rounded-xl border border-white/15 bg-[#1A1D24] p-2 shadow-2xl space-y-1 max-h-48 overflow-y-auto">
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-[0.65rem] font-mono uppercase text-zinc-400">
                Matching tags in database:
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-[0.65rem] text-zinc-500 hover:text-white"
              >
                Close ✕
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 p-1">
              {suggestions.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => addTag(sug)}
                  className="rounded-lg bg-zinc-900 hover:bg-brand-red hover:text-white border border-white/10 px-2.5 py-1 text-xs text-zinc-300 transition-colors"
                >
                  +{sug}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
