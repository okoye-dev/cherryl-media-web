import type { RelatedStory, CanonicalArticle } from "@/lib/types";

interface EditorMoreStoriesProps {
  relatedStories: RelatedStory[];
  articlesList: CanonicalArticle[];
  onAddRelatedStory: (story: RelatedStory) => void;
  onUpdateRelatedStory: (index: number, updated: Partial<RelatedStory>) => void;
  onRemoveRelatedStory: (index: number) => void;
}

export default function EditorMoreStories({
  relatedStories,
  articlesList,
  onAddRelatedStory,
  onUpdateRelatedStory,
  onRemoveRelatedStory,
}: EditorMoreStoriesProps) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#16181D] p-5 sm:p-7 space-y-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.06] pb-3 gap-2">
        <div>
          <span className="text-[0.68rem] font-mono uppercase tracking-wider text-brand-red font-semibold block">
            &ldquo;MORE STORIES&rdquo; FOOTER SECTION
          </span>
          <p className="text-xs text-zinc-400 mt-0.5">
            Displays internal or external post cards at the conclusion of this article.
          </p>
        </div>
        <button
          type="button"
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
          className="rounded-lg bg-zinc-800 hover:bg-zinc-700 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors self-start sm:self-auto"
        >
          + Add More Story Card
        </button>
      </div>

      {relatedStories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-xs text-zinc-500">
          No &ldquo;More Stories&rdquo; attached yet. Click the button above to add internal or external story cards.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {relatedStories.map((story, rIdx) => (
            <div
              key={rIdx}
              className="rounded-xl border border-white/10 bg-[#1A1D24] p-4 space-y-3 relative group"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <span className="text-[0.65rem] font-mono font-semibold text-brand-red uppercase">
                  Story Card #{rIdx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveRelatedStory(rIdx)}
                  className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
                >
                  Remove
                </button>
              </div>

              {/* Quick selection from articles */}
              <div>
                <select
                  onChange={(e) => {
                    const match = articlesList.find((a) => a.slug === e.target.value);
                    if (match) {
                      onUpdateRelatedStory(rIdx, {
                        title: match.title,
                        slug: match.slug,
                        category: match.categoryName || match.category,
                        deck: match.excerpt || match.deck,
                        imageUrl: match.featuredImage?.url,
                      });
                    }
                  }}
                  className="h-8 w-full rounded-lg border border-white/10 bg-zinc-900 px-2 text-[0.7rem] text-zinc-300 focus:outline-none truncate"
                >
                  <option value="">Quick auto-fill from published stories...</option>
                  {articlesList.map((a) => (
                    <option key={a.slug} value={a.slug}>
                      {a.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[0.65rem] font-semibold uppercase text-zinc-400 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={story.title || ""}
                  onChange={(e) => onUpdateRelatedStory(rIdx, { title: e.target.value })}
                  placeholder="Story title..."
                  className="h-9 w-full rounded-lg border border-white/10 bg-[#141519] px-2.5 text-xs text-white focus:border-brand-red focus:outline-none"
                />
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <label className="block text-[0.65rem] font-semibold uppercase text-zinc-400 mb-1">
                    Slug / URL
                  </label>
                  <input
                    type="text"
                    value={story.slug || story.url || ""}
                    onChange={(e) => onUpdateRelatedStory(rIdx, { slug: e.target.value, url: e.target.value })}
                    placeholder="story-slug or https://..."
                    className="h-9 w-full rounded-lg border border-white/10 bg-[#141519] px-2.5 text-xs font-mono text-zinc-200 focus:border-brand-red focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[0.65rem] font-semibold uppercase text-zinc-400 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={story.category || ""}
                    onChange={(e) => onUpdateRelatedStory(rIdx, { category: e.target.value })}
                    placeholder="e.g. NEWSBEAT"
                    className="h-9 w-full rounded-lg border border-white/10 bg-[#141519] px-2.5 text-xs text-zinc-200 focus:border-brand-red focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[0.65rem] font-semibold uppercase text-zinc-400 mb-1">
                  Thumbnail URL
                </label>
                <input
                  type="text"
                  value={story.imageUrl || ""}
                  onChange={(e) => onUpdateRelatedStory(rIdx, { imageUrl: e.target.value })}
                  placeholder="https://... or /uploads/..."
                  className="h-9 w-full rounded-lg border border-white/10 bg-[#141519] px-2.5 text-xs font-mono text-zinc-200 focus:border-brand-red focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[0.65rem] font-semibold uppercase text-zinc-400 mb-1">
                  Excerpt / Deck
                </label>
                <input
                  type="text"
                  value={story.deck || ""}
                  onChange={(e) => onUpdateRelatedStory(rIdx, { deck: e.target.value })}
                  placeholder="Short card excerpt..."
                  className="h-9 w-full rounded-lg border border-white/10 bg-[#141519] px-2.5 text-xs text-zinc-300 focus:border-brand-red focus:outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
