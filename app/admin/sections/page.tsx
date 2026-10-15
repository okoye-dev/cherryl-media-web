"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  SECTION_METADATA,
  DEFAULT_SECTION_KEYS,
  type CuratedSection,
  getCuratedSections,
  searchArticles,
  updateAllCuratedSections,
  fetchAllArticles,
} from "@/lib/sections";
import type { CanonicalArticle } from "@/lib/types";

interface SlotTarget {
  sectionKey: string;
  slotIndex: number;
}

export default function AdminSectionsPage() {
  const [sections, setSections] = useState<Record<string, CuratedSection>>({});
  const [catalog, setCatalog] = useState<CanonicalArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Search Modal State
  const [activePicker, setActivePicker] = useState<SlotTarget | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CanonicalArticle[]>([]);
  const [searching, setSearching] = useState(false);

  // Load initial sections and catalog
  useEffect(() => {
    async function loadData() {
      try {
        const [secData, arts] = await Promise.all([
          getCuratedSections(),
          fetchAllArticles(),
        ]);
        setSections(secData.byKey || {});
        setCatalog(arts);
      } catch (err) {
        console.error("Failed to load curated sections", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Quick lookup map for catalog articles by ID or slug
  const articleMap = useMemo(() => {
    const map = new Map<string, CanonicalArticle>();
    for (const a of catalog) {
      map.set(a.id, a);
      map.set(a.slug, a);
    }
    return map;
  }, [catalog]);

  // Real-time search effect
  useEffect(() => {
    if (!activePicker) return;
    const timeout = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchArticles(searchQuery, 30);
        setSearchResults(results);
      } catch (err) {
        console.error("Search error", err);
      } finally {
        setSearching(false);
      }
    }, 150);
    return () => clearTimeout(timeout);
  }, [searchQuery, activePicker]);

  const openPicker = (sectionKey: string, slotIndex: number) => {
    setActivePicker({ sectionKey, slotIndex });
    setSearchQuery("");
    setSearchResults(catalog.slice(0, 20));
  };

  const closePicker = () => {
    setActivePicker(null);
    setSearchQuery("");
  };

  const selectArticleForSlot = (article: CanonicalArticle) => {
    if (!activePicker) return;
    const { sectionKey, slotIndex } = activePicker;

    setSections((prev) => {
      const currentSec = prev[sectionKey] || {
        sectionKey,
        articleIds: [],
        articles: [],
      };

      const newIds = [...(currentSec.articleIds || [])];
      if (slotIndex >= newIds.length) {
        newIds.push(article.id);
      } else {
        newIds[slotIndex] = article.id;
      }

      // Re-resolve articles
      const newArticles = newIds
        .map((id) => articleMap.get(id) || article)
        .filter(Boolean);

      return {
        ...prev,
        [sectionKey]: {
          ...currentSec,
          articleIds: newIds,
          articles: newArticles,
          updatedAt: new Date().toISOString(),
        },
      };
    });

    closePicker();
  };

  const removeArticleFromSlot = (sectionKey: string, slotIndex: number) => {
    setSections((prev) => {
      const currentSec = prev[sectionKey];
      if (!currentSec) return prev;

      const newIds = currentSec.articleIds.filter((_, i) => i !== slotIndex);
      const newArticles = currentSec.articles.filter((_, i) => i !== slotIndex);

      return {
        ...prev,
        [sectionKey]: {
          ...currentSec,
          articleIds: newIds,
          articles: newArticles,
          updatedAt: new Date().toISOString(),
        },
      };
    });
  };

  const moveSlot = (sectionKey: string, fromIndex: number, toIndex: number) => {
    setSections((prev) => {
      const currentSec = prev[sectionKey];
      if (!currentSec) return prev;

      const newIds = [...currentSec.articleIds];
      const newArticles = [...currentSec.articles];

      if (toIndex < 0 || toIndex >= newIds.length) return prev;

      const [movedId] = newIds.splice(fromIndex, 1);
      newIds.splice(toIndex, 0, movedId);

      const [movedArt] = newArticles.splice(fromIndex, 1);
      newArticles.splice(toIndex, 0, movedArt);

      return {
        ...prev,
        [sectionKey]: {
          ...currentSec,
          articleIds: newIds,
          articles: newArticles,
          updatedAt: new Date().toISOString(),
        },
      };
    });
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setSaveSuccess(null);
    setSaveError(null);

    const payload = Object.entries(sections).map(([key, sec]) => ({
      sectionKey: key,
      articleIds: sec.articleIds,
      metadata: sec.metadata || {},
    }));

    try {
      const ok = await updateAllCuratedSections(payload);
      if (ok) {
        setSaveSuccess(`All layout sections saved successfully at ${new Date().toLocaleTimeString()}`);
        setTimeout(() => setSaveSuccess(null), 5000);
      } else {
        setSaveError("Failed to persist changes to backend API");
      }
    } catch (err: unknown) {
      setSaveError(
        err instanceof Error ? err.message : "An unexpected error occurred while saving"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-zinc-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-red border-t-transparent" />
          <span className="font-mono text-xs uppercase tracking-wider">Loading curated sections...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner / Actions */}
      <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-brand-red animate-pulse" />
            <h1 className="font-sans text-xl font-bold tracking-tight text-white sm:text-2xl">
              Curated Homepage Sections
            </h1>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Control which database articles populate each section of the cherrylmedia website.
            Changes persist directly to the PostgreSQL database.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
          >
            Preview Site ↗
          </Link>
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-brand-red px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-brand-red/20 transition-all hover:bg-brand-red/90 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving to Database...
              </>
            ) : (
              "Save Curated Layout"
            )}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs font-medium text-emerald-400 flex items-center justify-between">
          <span>✓ {saveSuccess}</span>
          <button onClick={() => setSaveSuccess(null)} className="text-emerald-400/60 hover:text-emerald-400">✕</button>
        </div>
      )}
      {saveError && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs font-medium text-red-400 flex items-center justify-between">
          <span>⚠ {saveError}</span>
          <button onClick={() => setSaveError(null)} className="text-red-400/60 hover:text-red-400">✕</button>
        </div>
      )}

      {/* Sections Grid */}
      <div className="space-y-6">
        {DEFAULT_SECTION_KEYS.map((key) => {
          const meta = SECTION_METADATA[key] || {
            title: key,
            subtitle: "Curated section slot",
            maxSlots: 1,
          };
          const sec = sections[key] || {
            sectionKey: key,
            articleIds: [],
            articles: [],
          };
          const currentArticleIds = sec.articleIds || [];

          return (
            <div
              key={key}
              className="rounded-2xl border border-white/[0.08] bg-[#141519] p-5 sm:p-6 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-brand-red">
                      {key}
                    </span>
                    <span className="text-xs text-zinc-500">·</span>
                    <h2 className="text-sm sm:text-base font-semibold text-white">
                      {meta.title}
                    </h2>
                    <span className="rounded bg-white/[0.05] px-2 py-0.5 font-mono text-[0.65rem] text-zinc-400">
                      {currentArticleIds.length} / {meta.maxSlots} Slots Filled
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-400">{meta.subtitle}</p>
                </div>

                {currentArticleIds.length < meta.maxSlots && (
                  <button
                    type="button"
                    onClick={() => openPicker(key, currentArticleIds.length)}
                    className="self-start sm:self-auto rounded-lg border border-dashed border-white/20 bg-white/[0.02] px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-brand-red/50 hover:bg-white/[0.04] hover:text-white transition-all"
                  >
                    + Add Story Slot
                  </button>
                )}
              </div>

              {/* Slot Items */}
              <div className="mt-4 space-y-3">
                {currentArticleIds.length === 0 ? (
                  <div className="flex items-center justify-between rounded-xl border border-dashed border-white/10 bg-white/[0.01] p-6 text-center text-xs text-zinc-500">
                    <span>No articles assigned to this section. Click &ldquo;Add Story Slot&rdquo; to pick from the database.</span>
                    <button
                      type="button"
                      onClick={() => openPicker(key, 0)}
                      className="rounded bg-white/[0.06] px-3 py-1 text-xs text-zinc-300 hover:text-white"
                    >
                      Assign Article
                    </button>
                  </div>
                ) : (
                  currentArticleIds.map((artId, idx) => {
                    const article = articleMap.get(artId) || sec.articles?.[idx];
                    return (
                      <div
                        key={`${artId}-${idx}`}
                        className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-white/[0.05] bg-white/[0.02] p-4 transition-colors hover:border-white/10 hover:bg-white/[0.04]"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <span className="font-mono text-xs font-bold text-zinc-500 w-6">
                            0{idx + 1}
                          </span>

                          {article?.featuredImage?.url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={article.featuredImage.url}
                              alt={article.title}
                              className="h-14 w-20 flex-shrink-0 rounded-lg object-cover border border-white/10"
                            />
                          ) : (
                            <div className="h-14 w-20 flex-shrink-0 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center text-[0.65rem] font-mono text-zinc-500">
                              NO IMG
                            </div>
                          )}

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              {article?.kicker && (
                                <span className="font-mono text-[0.65rem] font-semibold uppercase tracking-wider text-brand-red truncate max-w-[200px]">
                                  {article.kicker}
                                </span>
                              )}
                              <span className="rounded bg-white/[0.06] px-1.5 py-0.2 font-mono text-[0.62rem] text-zinc-400">
                                {article?.categoryName || article?.category || "Article"}
                              </span>
                            </div>
                            <h3 className="mt-1 text-xs sm:text-sm font-medium text-white truncate max-w-xl">
                              {article?.title || `Article ID: ${artId}`}
                            </h3>
                            <div className="mt-1 flex items-center gap-3 text-[0.68rem] text-zinc-400">
                              <span>By {typeof article?.author === "string" ? article?.author : article?.author?.name || "Editorial Desk"}</span>
                              <span>·</span>
                              <span className="font-mono text-zinc-500 truncate max-w-[150px]">{artId}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {/* Reorder Buttons */}
                          {meta.maxSlots > 1 && (
                            <div className="flex items-center rounded-lg border border-white/10 bg-white/[0.02]">
                              <button
                                type="button"
                                onClick={() => moveSlot(key, idx, idx - 1)}
                                disabled={idx === 0}
                                className="px-2 py-1 text-xs text-zinc-400 hover:text-white disabled:opacity-20"
                                title="Move Up"
                              >
                                ↑
                              </button>
                              <span className="text-zinc-600">|</span>
                              <button
                                type="button"
                                onClick={() => moveSlot(key, idx, idx + 1)}
                                disabled={idx === currentArticleIds.length - 1}
                                className="px-2 py-1 text-xs text-zinc-400 hover:text-white disabled:opacity-20"
                                title="Move Down"
                              >
                                ↓
                              </button>
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => openPicker(key, idx)}
                            className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-zinc-300 hover:border-white/20 hover:text-white transition-colors"
                          >
                            Replace
                          </button>
                          <button
                            type="button"
                            onClick={() => removeArticleFromSlot(key, idx)}
                            className="rounded-lg border border-red-500/20 bg-red-500/10 px-2 py-1 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors"
                            title="Remove from slot"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Article Picker Modal */}
      {activePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-3xl rounded-2xl border border-white/15 bg-[#17181D] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Select Article for &ldquo;{SECTION_METADATA[activePicker.sectionKey]?.title}&rdquo;
                </h3>
                <p className="mt-0.5 text-xs text-zinc-400">
                  Search across all published articles in the database by headline, kicker, or category.
                </p>
              </div>
              <button
                type="button"
                onClick={closePicker}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Search Input Bar */}
            <div className="p-4 border-b border-white/10 bg-white/[0.01]">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type to search articles in database (e.g. Energy, NERC, Nollywood, Transit)..."
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 pl-10 text-xs text-white placeholder-zinc-500 focus:border-brand-red focus:outline-none"
                  autoFocus
                />
                <span className="absolute left-3.5 top-3 text-zinc-500 text-xs">
                  🔍
                </span>
                {searching && (
                  <div className="absolute right-3.5 top-3">
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-brand-red border-t-transparent" />
                  </div>
                )}
              </div>
            </div>

            {/* Article Results List */}
            <div className="overflow-y-auto divide-y divide-white/[0.05] p-2 flex-1">
              {searchResults.length === 0 ? (
                <div className="py-12 text-center text-xs text-zinc-500">
                  No articles found matching &ldquo;{searchQuery}&rdquo;. Try another search term.
                </div>
              ) : (
                searchResults.map((art) => (
                  <button
                    key={art.id}
                    type="button"
                    onClick={() => selectArticleForSlot(art)}
                    className="w-full text-left flex items-center justify-between gap-4 p-3 rounded-xl hover:bg-white/[0.05] transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {art.featuredImage?.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={art.featuredImage.url}
                          alt={art.title}
                          className="h-12 w-16 flex-shrink-0 rounded-lg object-cover border border-white/10"
                        />
                      ) : (
                        <div className="h-12 w-16 flex-shrink-0 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center text-[0.6rem] font-mono text-zinc-500">
                          NO IMG
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          {art.kicker && (
                            <span className="font-mono text-[0.62rem] font-semibold uppercase tracking-wider text-brand-red truncate max-w-[200px]">
                              {art.kicker}
                            </span>
                          )}
                          <span className="rounded bg-white/[0.06] px-1.5 py-0.2 font-mono text-[0.6rem] text-zinc-400">
                            {art.categoryName || art.category}
                          </span>
                        </div>
                        <h4 className="mt-0.5 text-xs font-medium text-white truncate max-w-lg group-hover:text-brand-red transition-colors">
                          {art.title}
                        </h4>
                        <span className="mt-0.5 block text-[0.65rem] text-zinc-400 font-mono">
                          ID: {art.id} · {typeof art.author === "string" ? art.author : art.author?.name}
                        </span>
                      </div>
                    </div>

                    <span className="rounded-lg border border-brand-red/40 bg-brand-red/10 px-3 py-1 text-xs font-semibold text-brand-red group-hover:bg-brand-red group-hover:text-white transition-all flex-shrink-0">
                      Select Slot
                    </span>
                  </button>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-white/10 p-4 bg-black/30 text-xs text-zinc-400">
              <span>Showing {searchResults.length} articles</span>
              <button
                type="button"
                onClick={closePicker}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-zinc-300 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
