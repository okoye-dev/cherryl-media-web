import React, { useState, useEffect } from "react";
import type { CanonicalArticle } from "@/lib/types";
import { SECTION_METADATA } from "@/lib/sections";
import { articleService } from "@/services";
import type { SlotTarget } from "@/hooks/useCuratedSections";
import { SITE } from "@/config/site";
import { formatDate } from "@/lib/formatters";

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
  const meta = SECTION_METADATA[picker.sectionKey];

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(
    meta?.categoryHint || ""
  );
  const [sortOrder, setSortOrder] = useState<"recent" | "relevance">("recent");
  const [searchResults, setSearchResults] = useState<CanonicalArticle[]>(() =>
    catalog.slice(0, 25)
  );
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      setSearching(true);
      try {
        const q = searchQuery.toLowerCase().trim();
        const results = await articleService.searchCuratedArticles({
          category: selectedCategory,
          query: q,
          sort: sortOrder,
          limit: 35,
        }).catch(() => []);

        if (results && results.length > 0) {
          setSearchResults(results);
        } else {
          // Fallback to local catalog filtering
          let filtered = catalog.filter((a) => {
            if (selectedCategory && a.category !== selectedCategory && a.categoryName !== selectedCategory) {
              return false;
            }
            if (!q) return true;
            return (
              a.title.toLowerCase().includes(q) ||
              (a.kicker && a.kicker.toLowerCase().includes(q)) ||
              (a.deck && a.deck.toLowerCase().includes(q)) ||
              (a.subtitle && a.subtitle.toLowerCase().includes(q)) ||
              (a.excerpt && a.excerpt.toLowerCase().includes(q))
            );
          });

          if (sortOrder === "recent") {
            filtered = [...filtered].sort((a, b) => {
              const tA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
              const tB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
              return tB - tA;
            });
          }

          setSearchResults(filtered.slice(0, 35));
        }
      } catch (err) {
        console.error("Curation search error", err);
      } finally {
        setSearching(false);
      }
    }, 150);

    return () => clearTimeout(timeout);
  }, [searchQuery, selectedCategory, sortOrder, catalog]);

  const handleSelectFeatured = async (art: CanonicalArticle) => {
    try {
      await articleService.setFeatured(art.id, true).catch(() => {});
    } catch {}
    onSelect(art);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-4xl rounded-2xl border border-white/15 bg-[#16181D] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-5 bg-[#141519]">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-brand-red font-bold">
                {picker.sectionKey}
              </span>
              <span className="text-zinc-600">·</span>
              <h3 className="text-sm sm:text-base font-semibold text-white">
                Select Article for &ldquo;{meta?.title || picker.sectionKey}&rdquo;
              </h3>
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              Pick by recency, search by headline, or filter by editorial section. Inspect the full story gist below.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 hover:bg-white/[0.06] hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="p-4 border-b border-white/10 bg-[#121317] space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, gist, keywords, or kicker..."
                autoFocus
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-brand-red focus:outline-none"
              />
              {searching && (
                <div className="absolute right-3.5 top-3 h-4 w-4 animate-spin rounded-full border-2 border-brand-red border-t-transparent" />
              )}
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-auto rounded-xl border border-white/10 bg-[#1a1b20] px-3.5 py-2.5 text-xs text-zinc-200 focus:border-brand-red focus:outline-none"
            >
              <option value="">All Editorial Sections</option>
              {SITE.categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Sort Toggle */}
            <div className="flex items-center rounded-xl border border-white/10 bg-[#1a1b20] p-1 text-xs shrink-0">
              <button
                type="button"
                onClick={() => setSortOrder("recent")}
                className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
                  sortOrder === "recent"
                    ? "bg-brand-red text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Recent
              </button>
              <button
                type="button"
                onClick={() => setSortOrder("relevance")}
                className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
                  sortOrder === "relevance"
                    ? "bg-brand-red text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Relevance
              </button>
            </div>
          </div>
        </div>

        {/* Results List: Rich Gist View */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-white/[0.04]">
          {searchResults.length === 0 ? (
            <div className="p-12 text-center text-xs text-zinc-500">
              {searching
                ? "Searching publication database..."
                : "No matching articles found in publication database."}
            </div>
          ) : (
            searchResults.map((art) => (
              <div
                key={art.id}
                onClick={() => onSelect(art)}
                className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 rounded-xl hover:bg-white/[0.04] cursor-pointer transition-colors group border border-transparent hover:border-white/10"
              >
                <div className="flex items-start gap-4 min-w-0">
                  {/* Story Thumbnail (16:9 Gist) */}
                  {art.featuredImage?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={art.featuredImage.url}
                      alt={art.title}
                      className="h-16 w-24 sm:h-20 sm:w-28 rounded-xl object-cover border border-white/10 flex-shrink-0"
                    />
                  ) : (
                    <div className="h-16 w-24 sm:h-20 sm:w-28 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-[0.65rem] font-mono text-zinc-500 flex-shrink-0">
                      NO COVER
                    </div>
                  )}

                  {/* Story Gist Details */}
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[0.62rem] uppercase tracking-wider text-brand-red font-bold">
                        {art.categoryName || art.category}
                      </span>
                      {art.kicker && (
                        <>
                          <span className="text-zinc-600">·</span>
                          <span className="font-mono text-[0.62rem] text-zinc-400 truncate max-w-xs font-semibold">
                            {art.kicker}
                          </span>
                        </>
                      )}
                      <span className="text-zinc-600">·</span>
                      <span className="font-mono text-[0.62rem] text-zinc-500">
                        {art.publishedAt ? formatDate(art.publishedAt) : "Draft"}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-semibold text-white group-hover:text-brand-red transition-colors leading-snug line-clamp-1">
                      {art.title}
                    </h4>

                    {/* Gist: Deck / Subtitle */}
                    {(art.deck || art.subtitle || art.excerpt) && (
                      <p className="text-[0.72rem] text-zinc-400 line-clamp-2 leading-relaxed">
                        {art.deck || art.subtitle || art.excerpt}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-[0.65rem] text-zinc-500 pt-0.5">
                      <span>By {typeof art.author === "string" ? art.author : art.author?.name || "Editorial Desk"}</span>
                      <span>·</span>
                      <span className="font-mono text-zinc-600 truncate max-w-[140px]">{art.slug}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {picker.sectionKey === "hero_lead" ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectFeatured(art);
                      }}
                      className="rounded-lg bg-brand-red px-3.5 py-2 text-xs font-semibold text-white shadow-md hover:bg-brand-red/90 transition-all shrink-0"
                    >
                      ★ Set as Featured
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(art);
                      }}
                      className="rounded-lg bg-white/[0.06] px-3.5 py-1.5 text-xs font-semibold text-zinc-200 group-hover:bg-brand-red group-hover:text-white transition-all shrink-0"
                    >
                      Assign Slot
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-white/10 p-4 bg-[#141519] text-xs text-zinc-400">
          <span>{searchResults.length} articles found matching criteria</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-zinc-300 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
