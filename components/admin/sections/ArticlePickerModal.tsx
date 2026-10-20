import React, { useState, useEffect } from "react";
import type { CanonicalArticle } from "@/lib/types";
import { SECTION_METADATA } from "@/lib/sections";
import { articleService } from "@/services";
import type { SlotTarget } from "@/hooks/useCuratedSections";

interface ArticlePickerModalProps {
  picker: SlotTarget;
  catalog: CanonicalArticle[];
  onSelect: (article: CanonicalArticle) => void;
  onClose: () => void;
}

export function ArticlePickerModal({
  picker,
  catalog,
  onSelect,
  onClose,
}: ArticlePickerModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CanonicalArticle[]>(() =>
    catalog.slice(0, 20)
  );
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      setSearching(true);
      try {
        const q = searchQuery.toLowerCase().trim();
        if (!q) {
          setSearchResults(catalog.slice(0, 25));
        } else {
          // Use searchArticles from articleService with catalog fallback
          const serviceResults = await articleService.searchArticles(q, 30).catch(() => []);
          if (serviceResults.length > 0) {
            setSearchResults(serviceResults);
          } else {
            setSearchResults(
              catalog
                .filter(
                  (a) =>
                    a.title.toLowerCase().includes(q) ||
                    (a.kicker && a.kicker.toLowerCase().includes(q)) ||
                    (a.deck && a.deck.toLowerCase().includes(q)) ||
                    a.category.toLowerCase().includes(q)
                )
                .slice(0, 30)
            );
          }
        }
      } catch (err) {
        console.error("Search error", err);
      } finally {
        setSearching(false);
      }
    }, 150);

    return () => clearTimeout(timeout);
  }, [searchQuery, catalog]);

  const meta = SECTION_METADATA[picker.sectionKey];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-3xl rounded-2xl border border-white/15 bg-[#17181D] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Select Article for &ldquo;{meta?.title || picker.sectionKey}&rdquo;
            </h3>
            <p className="mt-0.5 text-xs text-zinc-400">
              Search across all published articles in the database by headline, kicker, or category.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 hover:bg-white/[0.06] hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Search input bar */}
        <div className="p-4 border-b border-white/10 bg-[#141519]">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, keywords, category, or kicker..."
              autoFocus
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-brand-red focus:outline-none"
            />
            {searching && (
              <div className="absolute right-3.5 top-3 h-4 w-4 animate-spin rounded-full border-2 border-brand-red border-t-transparent" />
            )}
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-white/[0.04]">
          {searchResults.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500">
              {searching ? "Searching database..." : "No matching articles found in publication database."}
            </div>
          ) : (
            searchResults.map((art) => (
              <div
                key={art.id}
                onClick={() => onSelect(art)}
                className="pt-2.5 first:pt-0 flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-white/[0.04] cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {art.featuredImage?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={art.featuredImage.url}
                      alt={art.title}
                      className="h-12 w-16 rounded-lg object-cover border border-white/10 flex-shrink-0"
                    />
                  ) : (
                    <div className="h-12 w-16 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center text-[0.6rem] font-mono text-zinc-500 flex-shrink-0">
                      NO IMG
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[0.62rem] uppercase tracking-wider text-brand-red font-semibold">
                        {art.categoryName || art.category}
                      </span>
                      {art.kicker && (
                        <>
                          <span className="text-zinc-600">·</span>
                          <span className="font-mono text-[0.62rem] text-zinc-400 truncate max-w-xs">
                            {art.kicker}
                          </span>
                        </>
                      )}
                    </div>
                    <h4 className="mt-0.5 text-xs sm:text-sm font-medium text-white truncate group-hover:text-brand-red transition-colors">
                      {art.title}
                    </h4>
                    <span className="text-[0.68rem] text-zinc-500">
                      By {typeof art.author === "string" ? art.author : art.author?.name || "Editorial Desk"} · {art.slug}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="rounded-lg bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-zinc-200 group-hover:bg-brand-red group-hover:text-white transition-all shrink-0"
                >
                  Select Slot
                </button>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-white/10 p-4 bg-[#141519] text-xs text-zinc-400">
          <span>{searchResults.length} articles available for placement</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-zinc-300 hover:text-white"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
