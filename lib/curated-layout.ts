import type { CuratedSection } from "@/config/sections";
import type { CanonicalArticle } from "@/lib/types";

export type Sections = Record<string, CuratedSection>;
export type IdMap = Record<string, string[]>;

export function toIds(byKey: Sections | undefined): IdMap {
  const out: IdMap = {};
  for (const [k, v] of Object.entries(byKey || {})) out[k] = v.articleIds || [];
  return out;
}

export function sameIds(a: IdMap, b: IdMap) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) {
    const x = a[k] || [];
    const y = b[k] || [];
    if (x.length !== y.length || x.some((id, i) => id !== y[i])) return false;
  }
  return true;
}

const touched = (sec: CuratedSection, articleIds: string[], articles: CanonicalArticle[]): CuratedSection => ({
  ...sec,
  articleIds,
  articles,
  updatedAt: new Date().toISOString(),
});

export function placeInSlot(
  sections: Sections,
  sectionKey: string,
  slotIndex: number,
  article: CanonicalArticle,
  articleMap: Map<string, CanonicalArticle>
): Sections {
  const sec = sections[sectionKey] || { sectionKey, articleIds: [], articles: [] };
  const ids = [...(sec.articleIds || [])];
  if (slotIndex >= ids.length) ids.push(article.id);
  else ids[slotIndex] = article.id;
  const articles = ids.map((id) => articleMap.get(id) || article).filter(Boolean);
  return { ...sections, [sectionKey]: touched(sec, ids, articles) };
}

export function removeFromSlot(sections: Sections, sectionKey: string, slotIndex: number): Sections {
  const sec = sections[sectionKey];
  if (!sec) return sections;
  return {
    ...sections,
    [sectionKey]: touched(
      sec,
      sec.articleIds.filter((_, i) => i !== slotIndex),
      sec.articles.filter((_, i) => i !== slotIndex)
    ),
  };
}

export function moveInSlot(sections: Sections, sectionKey: string, from: number, to: number): Sections {
  const sec = sections[sectionKey];
  if (!sec || to < 0 || to >= sec.articleIds.length) return sections;

  const ids = [...sec.articleIds];
  const articles = [...sec.articles];
  ids.splice(to, 0, ids.splice(from, 1)[0]);
  articles.splice(to, 0, articles.splice(from, 1)[0]);
  return { ...sections, [sectionKey]: touched(sec, ids, articles) };
}
