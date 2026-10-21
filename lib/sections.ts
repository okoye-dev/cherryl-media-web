import type { CanonicalArticle } from "@/lib/types";
import {
  DEFAULT_SECTION_KEYS,
  SECTION_METADATA,
  type CuratedSection,
  type CuratedSectionsResponse,
} from "@/config/sections";

export function sectionArticles(curated: CuratedSectionsResponse, key: string): CanonicalArticle[] {
  const max = SECTION_METADATA[key]?.maxSlots ?? Infinity;
  return (curated.byKey?.[key]?.articles || []).slice(0, max);
}

export function mergeLegacySections<T extends CuratedSectionsResponse>(data: T): T {
  const side = data.byKey?.dossier_side;
  if (side && (side.articleIds?.length || 0) > 0) return data;
  const parts = ["dossier_soundscapes", "dossier_gastronomy"].map((k) => data.byKey?.[k]);
  const ids = parts.flatMap((p) => p?.articleIds || []);
  if (ids.length === 0) return data;
  const merged: CuratedSection = {
    sectionKey: "dossier_side",
    articleIds: ids,
    articles: parts.flatMap((p) => p?.articles || []),
  };
  return {
    ...data,
    sections: [...(data.sections || []).filter((x) => x.sectionKey !== "dossier_side"), merged],
    byKey: { ...data.byKey, dossier_side: merged },
  };
}

export function enforceSectionLimits<T extends CuratedSectionsResponse>(data: T): T {
  const trim = (sec: CuratedSection) => {
    const max = SECTION_METADATA[sec.sectionKey]?.maxSlots;
    if (!max) return sec;
    return {
      ...sec,
      articleIds: (sec.articleIds || []).slice(0, max),
      articles: (sec.articles || []).slice(0, max),
    };
  };
  const byKey: Record<string, CuratedSection> = {};
  for (const [k, v] of Object.entries(data.byKey || {})) byKey[k] = trim(v);
  return { ...data, sections: (data.sections || []).map(trim), byKey };
}

export function buildFallbackSections(): CuratedSectionsResponse {
  const sections: CuratedSection[] = [];
  const byKey: Record<string, CuratedSection> = {};

  for (const key of DEFAULT_SECTION_KEYS) {
    const sec: CuratedSection = {
      sectionKey: key,
      articleIds: [],
      articles: [],
    };
    sections.push(sec);
    byKey[key] = sec;
  }

  return { sections, byKey };
}
