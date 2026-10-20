import type { CanonicalArticle } from "./types";
import {
  SECTION_METADATA,
  DEFAULT_SECTION_KEYS,
  type CuratedSection,
  type CuratedSectionsResponse,
  fetchCuratedSections,
  updateCuratedSections,
} from "@/services/sections";
import { searchArticles as serviceSearchArticles, fetchArticles } from "@/services/articles";
import { CANONICAL_ARTICLES } from "./articles";

export {
  SECTION_METADATA,
  DEFAULT_SECTION_KEYS,
  type CuratedSection,
  type CuratedSectionsResponse,
};

export async function getCuratedSections(): Promise<CuratedSectionsResponse> {
  return fetchCuratedSections();
}

export async function searchArticles(query: string, limit = 20): Promise<CanonicalArticle[]> {
  try {
    const results = await serviceSearchArticles(query, limit);
    if (Array.isArray(results) && results.length > 0) {
      return results;
    }
  } catch {}

  const q = query.toLowerCase().trim();
  return CANONICAL_ARTICLES.filter(
    (a) =>
      !q ||
      a.title.toLowerCase().includes(q) ||
      (a.kicker && a.kicker.toLowerCase().includes(q)) ||
      (a.deck && a.deck.toLowerCase().includes(q)) ||
      a.category.toLowerCase().includes(q)
  ).slice(0, limit);
}

export async function fetchAllArticles(): Promise<CanonicalArticle[]> {
  try {
    const list = await fetchArticles({ status: "all" });
    if (Array.isArray(list) && list.length > 0) {
      return list;
    }
  } catch {}
  return CANONICAL_ARTICLES;
}

export async function updateCuratedSection(
  sectionKey: string,
  articleIds: string[],
  metadata: Record<string, unknown> = {}
): Promise<boolean> {
  try {
    const res = await updateCuratedSections([{ sectionKey, articleIds, metadata }]);
    return Boolean(res.success);
  } catch {
    return false;
  }
}

export async function updateAllCuratedSections(
  sections: { sectionKey: string; articleIds: string[]; metadata?: Record<string, unknown> }[]
): Promise<boolean> {
  try {
    const res = await updateCuratedSections(sections);
    return Boolean(res.success);
  } catch {
    return false;
  }
}
