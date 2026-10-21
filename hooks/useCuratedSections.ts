import { useState, useEffect, useMemo, useCallback } from "react";
import { fetchArticlesByIds } from "@/services/articles";
import type { CuratedSectionsResponse } from "@/config/sections";
import type { CanonicalArticle } from "@/lib/types";
import { request } from "@/services/api-client";
import { fetchCuratedSections, updateCuratedSections } from "@/services/sections";
import { enforceSectionLimits, mergeLegacySections } from "@/lib/sections";
import { moveInSlot, placeInSlot, removeFromSlot, sameIds, toIds, type IdMap, type Sections } from "@/lib/curated-layout";

export interface SlotTarget {
  sectionKey: string;
  slotIndex: number;
}

export function useCuratedSections() {
  const [sections, setSections] = useState<Sections>({});
  const [lookup, setLookup] = useState<Record<string, CanonicalArticle>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<IdMap | null>(null);

  const [activePicker, setActivePicker] = useState<SlotTarget | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const secData = await fetchCuratedSections();
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
      setSections((prev) => placeInSlot(prev, sectionKey, slotIndex, article, articleMap));
      closePicker();
    },
    [activePicker, articleMap, closePicker]
  );

  const removeArticleFromSlot = useCallback((sectionKey: string, slotIndex: number) => {
    setSections((prev) => removeFromSlot(prev, sectionKey, slotIndex));
  }, []);

  const moveSlot = useCallback((sectionKey: string, fromIndex: number, toIndex: number) => {
    setSections((prev) => moveInSlot(prev, sectionKey, fromIndex, toIndex));
  }, []);

  const saveAll = useCallback(async () => {
    setSaving(true);
    setSaveSuccess(null);
    setSaveError(null);

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
      const res = await updateCuratedSections(payload);
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
