import { request } from "./api-client";
import type { CanonicalArticle } from "@/lib/types";

export interface CuratedSection {
  sectionKey: string;
  articleIds: string[];
  articles: CanonicalArticle[];
  metadata?: Record<string, unknown>;
  updatedAt?: string;
}

export interface CuratedSectionsResponse {
  sections: CuratedSection[];
  byKey: Record<string, CuratedSection>;
}

/**
 * The single list of homepage slots. The homepage and the admin both read this,
 * so what you edit in the admin is exactly what the page shows.
 * Keys are the section keys stored in the database. maxSlots is how many stories
 * that spot on the page shows, and nothing beyond it is ever rendered or saved.
 * Listed in the order they appear on the page.
 */
export const SECTION_METADATA: Record<
  string,
  { title: string; subtitle: string; maxSlots: number; categoryHint?: string }
> = {
  hero_lead: {
    title: "Top story",
    subtitle: "The large featured story at the very top of the homepage",
    maxSlots: 1,
  },
  hero_trending: {
    title: "Trending stories",
    subtitle: "The list beside the top story, in the order shown",
    maxSlots: 3,
  },
  state_affairs: {
    title: "State Affairs & Environs",
    subtitle: "The picture cards in the State Affairs section",
    maxSlots: 4,
    categoryHint: "state-affairs-environs",
  },
  perspectives: {
    title: "Opinions & Perspectives",
    subtitle: "The opinions list next to State Affairs",
    maxSlots: 3,
    categoryHint: "opinions",
  },
  brands_smes: {
    title: "Brands & SMEs",
    subtitle: "The picture cards in the Brands & SMEs section",
    maxSlots: 3,
    categoryHint: "brands-smes",
  },
  dossier_lead: {
    title: "Culture: main feature",
    subtitle: "The large card on the left of the Culture section",
    maxSlots: 1,
  },
  dossier_side: {
    title: "Culture: side cards",
    subtitle: "The two cards in the middle of the Culture section, top to bottom",
    maxSlots: 2,
  },
  dossier_radar: {
    title: "Culture briefs",
    subtitle: "The short list on the right of the Culture section",
    maxSlots: 4,
  },
};

export const DEFAULT_SECTION_KEYS = Object.keys(SECTION_METADATA);

/**
 * The two Culture side cards used to be stored as two separate sections.
 * If the combined one is empty, build it from the old two so nothing disappears.
 * Saving from the admin then writes the combined section.
 */
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

/** Cuts every known section down to its slot count, so the data can never exceed what the page has room for. */
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

export async function fetchCuratedSections(): Promise<CuratedSectionsResponse> {
  try {
    const data = await request<CuratedSectionsResponse>("/api/sections", {
      next: { revalidate: 30 },
      timeoutMs: 15000,
    });
    if (data && data.byKey && Array.isArray(data.sections)) {
      return enforceSectionLimits(mergeLegacySections(data));
    }
  } catch (err) {
    console.warn("fetchCuratedSections warning:", err);
  }
  return buildFallbackSections();
}

export async function updateCuratedSections(
  sections: Array<{ sectionKey: string; articleIds: string[]; metadata?: Record<string, unknown> }>
): Promise<{ success: boolean; count?: number }> {
  return request<{ success: boolean; count?: number }>("/api/sections", {
    method: "POST",
    body: JSON.stringify({ sections }),
  });
}

/** One page of stories for the slot picker. The server filters, sorts and pages. Page numbers start at 1. */
export async function searchCurationPage(params: {
  q?: string;
  category?: string;
  sort?: "recent" | "relevance";
  page?: number;
  pageSize?: number;
}): Promise<{ articles: CanonicalArticle[]; total: number; page: number; pageSize: number; totalPages: number }> {
  const res = await request<{
    articles?: CanonicalArticle[];
    total?: number;
    page?: number;
    pageSize?: number;
    totalPages?: number;
  }>("/api/curation/search", {
    params: {
      q: params.q,
      category: params.category,
      sort: params.sort,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 8,
    },
    cache: "no-store",
  });
  const articles = Array.isArray(res.articles) ? res.articles : [];
  return {
    articles,
    total: res.total ?? articles.length,
    page: res.page ?? params.page ?? 1,
    pageSize: res.pageSize ?? params.pageSize ?? 8,
    totalPages: Math.max(1, res.totalPages ?? 1),
  };
}
