import React, { useState, useEffect, useRef } from "react";
import type { CanonicalArticle } from "@/lib/types";
import { SECTION_METADATA } from "@/config/sections";
import { setFeatured } from "@/services/articles";
import { searchCurationPage } from "@/services/sections";
import type { SlotTarget } from "@/hooks/useCuratedSections";
import { SITE } from "@/config/site";
import { formatDate } from "@/lib/formatters";
import { Badge, Btn, Pagination, Sheet, TextInput, inputClass } from "@/components/admin/ui";

const PAGE_SIZE = 8;

interface ArticlePickerModalProps {
  picker: SlotTarget;
  onSelect: (article: CanonicalArticle) => void;
  onClose: () => void;
}

export function ArticlePickerModal({ picker, onSelect, onClose }: ArticlePickerModalProps) {
  const meta = SECTION_METADATA[picker.sectionKey];

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(meta?.categoryHint || "");
  const [sortOrder, setSortOrder] = useState<"recent" | "relevance">("recent");
  const [page, setPage] = useState(1);
  const [searchResults, setSearchResults] = useState<CanonicalArticle[]>([]);
  const [paging, setPaging] = useState({ total: 0, totalPages: 1, pageSize: PAGE_SIZE });
  const [searching, setSearching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const seq = useRef(0);

  useEffect(() => setPage(1), [searchQuery, selectedCategory, sortOrder]);

  useEffect(() => {
    const mine = ++seq.current;
    setSearching(true);
    const t = setTimeout(
      () => {
        searchCurationPage({ q: searchQuery.trim(), category: selectedCategory, sort: sortOrder, page, pageSize: PAGE_SIZE })
          .then((r) => {
            if (mine !== seq.current) return;
            setSearchResults(r.articles);
            setPaging({ total: r.total, totalPages: r.totalPages, pageSize: r.pageSize });
            setError(null);
          })
          .catch((e) => mine === seq.current && setError(e instanceof Error ? e.message : "Could not load stories"))
          .finally(() => mine === seq.current && setSearching(false));
      },
      searchQuery ? 300 : 0
    );
    return () => clearTimeout(t);
  }, [searchQuery, selectedCategory, sortOrder, page]);

  const handleSelectFeatured = async (art: CanonicalArticle) => {
    try {
      await setFeatured(art.id, true).catch(() => {});
    } catch {}
    onSelect(art);
  };

  const isHero = picker.sectionKey === "hero_lead";
  const pick = (art: CanonicalArticle) => (isHero ? handleSelectFeatured(art) : onSelect(art));

  return (
    <Sheet
      onClose={onClose}
      size="tall"
      width="lg"
      title={<>Pick a story for {meta?.title || picker.sectionKey}</>}
      subtitle="Search by headline or filter by category."
      toolbar={
<div className="space-y-2">
          <div className="relative">
            <TextInput
              aria-label="Search stories"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, summary or kicker"
              autoFocus
              maxLength={200}
              className="!pr-10"
            />
            {searching && (
              <div className="absolute right-3 top-3 h-4 w-4 animate-spin rounded-full border-2 border-brand-red border-t-transparent" />
            )}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Category"
              className={`${inputClass} sm:flex-1`}
            >
              <option value="">All categories</option>
              {SITE.categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
            <div className="grid shrink-0 grid-cols-2 gap-1 rounded-lg border border-white/10 bg-[#1a1b20] p-1 sm:w-56">
              {(["recent", "relevance"] as const).map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setSortOrder(o)}
                  className={`h-10 whitespace-nowrap rounded-md text-xs font-medium transition-colors sm:h-8 ${
                    sortOrder === o ? "bg-brand-red text-white" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {o === "recent" ? "Recent" : "Relevance"}
                </button>
              ))}
            </div>
          </div>
        </div>
      }
      footer={
        <div className="w-full">
          <Pagination page={page} totalPages={paging.totalPages} total={paging.total} pageSize={paging.pageSize} onPage={setPage} busy={searching} />
        </div>
      }
    >
        <div className="-mx-2">
          {searchResults.length === 0 ? (
            <div className="p-10 text-center text-sm text-zinc-500">
              {error ? `Could not load stories. ${error}` : searching ? "Searching..." : "No matching stories found."}
            </div>
          ) : (
            <ul className="space-y-1">
              {searchResults.map((art) => (
                <li
                  key={art.id}
                  className="group relative flex min-w-0 items-start gap-3 rounded-lg border border-transparent p-2.5 transition-colors focus-within:border-white/20 hover:border-white/10 hover:bg-white/[0.05]"
                >
                  {art.featuredImage?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={art.featuredImage.url}
                      alt=""
                      className="h-14 w-20 shrink-0 rounded-md border border-white/10 object-cover sm:h-16 sm:w-24"
                    />
                  ) : (
                    <div className="flex h-14 w-20 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.05] text-xs text-zinc-500 sm:h-16 sm:w-24">
                      No cover
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs text-zinc-500">
                      <span className="text-brand-red">{art.categoryName || art.category}</span>
                      <span className="mx-1">·</span>
                      {art.publishedAt ? formatDate(art.publishedAt) : "Draft"}
                    </p>
                    <h4 className="mt-0.5 line-clamp-2 text-sm font-medium leading-snug text-white">
                      <button
                        type="button"
                        onClick={() => pick(art)}
                        className="text-left after:absolute after:inset-0 after:content-[''] focus:outline-none"
                      >
                        {art.title}
                      </button>
                    </h4>
                    {(art.deck || art.subtitle || art.excerpt) && (
                      <p className="mt-0.5 line-clamp-1 text-xs text-zinc-400 sm:line-clamp-2">
                        {art.deck || art.subtitle || art.excerpt}
                      </p>
                    )}
                    <p className="mt-0.5 truncate text-xs text-zinc-500">
                      By {typeof art.author === "string" ? art.author : art.author?.name || "Editorial desk"}
                    </p>
                    {art.status === "published" && art.slug && (
                      <Btn
                        href={`/article/${art.slug}`}
                        target="_blank"
                        arrow="forward"
                        variant="ghost"
                        size="sm"
                        className="relative z-10 -ml-2 mt-1 !h-10"
                      >
                        View story
                      </Btn>
                    )}
                  </div>
                  <Badge tone="neutral" className="hidden group-hover:border-brand-red group-hover:bg-brand-red group-hover:text-white sm:inline-flex">
                    {isHero ? "Set as featured" : "Assign"}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
    </Sheet>
  );
}
