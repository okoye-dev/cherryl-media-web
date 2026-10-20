import { useState, useEffect, useMemo, useCallback } from "react";
import { sectionService, articleService } from "@/services";
import type { CuratedSection } from "@/services/contracts/ISectionService";
import type { CanonicalArticle } from "@/lib/types";

export interface SlotTarget {
  sectionKey: string;
  slotIndex: number;
}

export function useCuratedSections() {
  const [sections, setSections] = useState<Record<string, CuratedSection>>({});
  const [catalog, setCatalog] = useState<CanonicalArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Active slot picker modal state
  const [activePicker, setActivePicker] = useState<SlotTarget | null>(null);

  // Load initial sections and catalog
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [secData, arts] = await Promise.all([
          sectionService.getCuratedSections(),
          articleService.getArticles({ status: "all" }).catch(() => []),
        ]);
        if (isMounted) {
          setSections(secData.byKey || {});
          setCatalog(Array.isArray(arts) ? arts : []);
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
    for (const a of catalog) {
      map.set(a.id, a);
      map.set(a.slug, a);
    }
    return map;
  }, [catalog]);

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

    const payload = Object.entries(sections).map(([key, sec]) => ({
      sectionKey: key,
      articleIds: sec.articleIds,
      metadata: sec.metadata || {},
    }));

    try {
      const res = await sectionService.updateCuratedSections(payload);
      if (res.success) {
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
  }, [sections]);

  return {
    sections,
    catalog,
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
