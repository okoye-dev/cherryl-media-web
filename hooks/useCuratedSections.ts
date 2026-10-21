import { useState, useEffect, useMemo, useCallback } from "react";
import { sectionService } from "@/services";
import { fetchArticlesByIds } from "@/services/articles";
import type { CuratedSection } from "@/services/contracts/ISectionService";
import type { CanonicalArticle } from "@/lib/types";
import { request } from "@/services/api-client";
import { enforceSectionLimits, mergeLegacySections, type CuratedSectionsResponse } from "@/services/sections";

type IdMap = Record<string, string[]>;

function toIds(byKey: Record<string, CuratedSection> | undefined): IdMap {
  const out: IdMap = {};
  for (const [k, v] of Object.entries(byKey || {})) out[k] = v.articleIds || [];
  return out;
}

/** True when both layouts hold the same ids in the same order. A missing section counts as empty. */
function sameIds(a: IdMap, b: IdMap) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) {
    const x = a[k] || [];
    const y = b[k] || [];
    if (x.length !== y.length || x.some((id, i) => id !== y[i])) return false;
  }
  return true;
}

export interface SlotTarget {
  sectionKey: string;
  slotIndex: number;
}

export function useCuratedSections() {
  const [sections, setSections] = useState<Record<string, CuratedSection>>({});
  /** Only the stories that sit in a slot (plus any just picked), looked up by id */
  const [lookup, setLookup] = useState<Record<string, CanonicalArticle>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  /** The slots as last loaded from, or confirmed by, the backend */
  const [savedIds, setSavedIds] = useState<IdMap | null>(null);

  // Active slot picker modal state
  const [activePicker, setActivePicker] = useState<SlotTarget | null>(null);

  // Load initial sections and catalog
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const secData = await sectionService.getCuratedSections();
        const byKey = secData.byKey || {};
        const ids = [...new Set(Object.values(byKey).flatMap((s) => s.articleIds || []))];
        const known: Record<string, CanonicalArticle> = {};
        for (const s of Object.values(byKey)) for (const a of s.articles || []) if (a?.id) known[a.id] = a;
        // One call for every story in a slot, not the whole catalogue.
        const fetched = await fetchArticlesByIds(ids.filter((id) => !known[id])).catch(() => []);
        for (const a of fetched) known[a.id] = a;
        if (isMounted) {
          setSections(byKey);
          setSavedIds(toIds(byKey));
          setLookup(known);
        }
      } catch (err) {
        console.error("Failed to load curated sections", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Quick lookup map for catalog articles by ID or slug
  const articleMap = useMemo(() => {
    const map = new Map<string, CanonicalArticle>();
    for (const a of Object.values(lookup)) {
      map.set(a.id, a);
      map.set(a.slug, a);
    }
    return map;
  }, [lookup]);

  const openPicker = useCallback((sectionKey: string, slotIndex: number) => {
    setActivePicker({ sectionKey, slotIndex });
  }, []);

  const closePicker = useCallback(() => {
    setActivePicker(null);
  }, []);

  const selectArticleForSlot = useCallback(
    (article: CanonicalArticle) => {
      if (!activePicker) return;
      const { sectionKey, slotIndex } = activePicker;
      setLookup((prev) => ({ ...prev, [article.id]: article }));

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
    },
    [activePicker, articleMap, closePicker]
  );

  const removeArticleFromSlot = useCallback((sectionKey: string, slotIndex: number) => {
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
  }, []);

  const moveSlot = useCallback((sectionKey: string, fromIndex: number, toIndex: number) => {
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
  }, []);

  const saveAll = useCallback(async () => {
    setSaving(true);
    setSaveSuccess(null);
    setSaveError(null);

    // Send only the sections whose stories changed since the last load or save.
    const payload = Object.entries(sections)
      .filter(([key, sec]) => !sameIds({ [key]: sec.articleIds || [] }, { [key]: savedIds?.[key] || [] }))
      .map(([key, sec]) => ({
        sectionKey: key,
        articleIds: sec.articleIds,
        metadata: sec.metadata || {},
      }));
    if (payload.length === 0) {
      setSaving(false);
      return;
    }

    try {
      const res = await sectionService.updateCuratedSections(payload);
      if (!res.success) {
        setSaveError("The server did not accept the layout. Nothing was saved.");
      } else {
        // Read it back from the database (no cache) to confirm it really stored.
        const fresh = await request<CuratedSectionsResponse>("/api/sections", {
          cache: "no-store",
          params: { _: Date.now() },
          timeoutMs: 15000,
        });
        const stored = toIds(enforceSectionLimits(mergeLegacySections(fresh)).byKey);
        setSavedIds(stored);
        const sent: IdMap = {};
        for (const p of payload) sent[p.sectionKey] = p.articleIds;
        const mismatch = Object.keys(sent).filter((k) => !sameIds({ [k]: sent[k] }, { [k]: stored[k] || [] }));
        if (mismatch.length === 0) {
          setSaveSuccess(`Saved and confirmed from the database at ${new Date().toLocaleTimeString()}`);
          setTimeout(() => setSaveSuccess(null), 5000);
        } else {
          setSaveError(`Saved, but the database returned different stories for: ${mismatch.join(", ")}. Review and save again.`);
        }
      }
    } catch (err: unknown) {
      setSaveError(
        err instanceof Error ? `Not saved. ${err.message}` : "Not saved. Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }, [sections, savedIds]);

  const dirty = useMemo(() => savedIds !== null && !sameIds(toIds(sections), savedIds), [sections, savedIds]);

  return {
    dirty,
    sections,
    articleMap,
    loading,
    saving,
    saveSuccess,
    saveError,
    activePicker,
    openPicker,
    closePicker,
    selectArticleForSlot,
    removeArticleFromSlot,
    moveSlot,
    saveAll,
    setSaveSuccess,
    setSaveError,
  };
}
