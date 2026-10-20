import { request } from "./api-client";
import type { CanonicalArticle } from "@/lib/types";
import { CANONICAL_ARTICLES } from "@/lib/articles";

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

export const SECTION_METADATA: Record<
  string,
  { title: string; subtitle: string; maxSlots: number; categoryHint?: string }
> = {
  hero_lead: {
    title: "Hero Lead Story",
    subtitle: "The primary headline feature anchoring the top of the homepage",
    maxSlots: 1,
  },
  hero_trending: {
    title: "Trending Stories",
    subtitle: "Top 3 dispatches alongside the Hero lead",
    maxSlots: 3,
  },
  featured_updates: {
    title: "Policy & Practical Updates",
    subtitle: "4 card figures covering governance, utility updates, and commercial finance",
    maxSlots: 4,
  },
  perspectives: {
    title: "Narratives & Perspectives",
    subtitle: "3 analytical columns and cultural field notes",
    maxSlots: 3,
  },
  dossier_lead: {
    title: "Culture: Main Feature",
    subtitle: "Featured culture and longform investigative story",
    maxSlots: 1,
  },
  dossier_soundscapes: {
    title: "Culture: Music & Soundscapes",
    subtitle: "Music industry, sonic profile, and arts slot",
    maxSlots: 1,
  },
  dossier_gastronomy: {
    title: "Culture: Food & Heritage",
    subtitle: "Food culture and regional culinary heritage slot",
    maxSlots: 1,
  },
  dossier_radar: {
    title: "Culture Briefs",
    subtitle: "4 quick cultural reads, arts announcements, and profiles",
    maxSlots: 4,
  },
};

export const DEFAULT_SECTION_KEYS = Object.keys(SECTION_METADATA);

export function buildFallbackSections(): CuratedSectionsResponse {
  const byID: Record<string, CanonicalArticle> = {};
  for (const a of CANONICAL_ARTICLES) {
    byID[a.id] = a;
    byID[a.slug] = a;
  }

  const defaultAllocations: Record<string, string[]> = {
    hero_lead: ["2f405add-8bba-5261-99af-15feaa62754b"],
    hero_trending: [
      "35588574-ec88-5a81-be90-8c46283c24de",
      "decd08ac-ef71-54ee-ac58-fd2480c007fa",
      "f10fad9c-c601-552e-a7b2-816b8c370ecc",
    ],
    featured_updates: [
      "25386df5-95e6-50ad-bc4c-3b6db589992d",
      "d41935e4-a14a-555e-85c1-e78d655f4886",
      "93630737-14e4-5cb8-a578-1cb81c7f9fc9",
      "b5585b9b-9c74-5555-897b-cfd8c0b58e7b",
    ],
    perspectives: [
      "6df67a6d-e4fb-5b23-a2a0-410a74799052",
      "c1995ecf-38ea-5a9e-8c53-c977792e3a8d",
      "970ca881-bf9d-5eb0-a540-34444585145b",
    ],
    dossier_lead: ["970ca881-bf9d-5eb0-a540-34444585145b"],
    dossier_soundscapes: ["35588574-ec88-5a81-be90-8c46283c24de"],
    dossier_gastronomy: ["b5585b9b-9c74-5555-897b-cfd8c0b58e7b"],
    dossier_radar: [
      "1d607e1e-0ca8-51f6-ae18-f2991dbbc1a3",
      "25386df5-95e6-50ad-bc4c-3b6db589992d",
      "d41935e4-a14a-555e-85c1-e78d655f4886",
      "6df67a6d-e4fb-5b23-a2a0-410a74799052",
    ],
  };

  const sections: CuratedSection[] = [];
  const byKey: Record<string, CuratedSection> = {};

  for (const key of DEFAULT_SECTION_KEYS) {
    const ids = defaultAllocations[key] || [];
    const arts: CanonicalArticle[] = [];
    for (const id of ids) {
      if (byID[id]) arts.push(byID[id]);
    }
    const sec: CuratedSection = {
      sectionKey: key,
      articleIds: ids,
      articles: arts,
    };
    sections.push(sec);
    byKey[key] = sec;
  }

  return { sections, byKey };
}

export async function fetchCuratedSections(): Promise<CuratedSectionsResponse> {
  const fallback = buildFallbackSections();
  try {
    const data = await request<CuratedSectionsResponse>("/api/sections", {
      next: { revalidate: 30 },
      timeoutMs: 3500,
    });
    if (data && data.byKey) {
      for (const key of DEFAULT_SECTION_KEYS) {
        if (!data.byKey[key] || !Array.isArray(data.byKey[key].articles) || data.byKey[key].articles.length === 0) {
          data.byKey[key] = fallback.byKey[key];
        }
      }
      return data;
    }
  } catch {
    // Fall back to canonical fallback dataset
  }
  return fallback;
}

export async function updateCuratedSections(
  sections: Array<{ sectionKey: string; articleIds: string[]; metadata?: Record<string, unknown> }>
): Promise<{ success: boolean; count?: number }> {
  return request<{ success: boolean; count?: number }>("/api/sections", {
    method: "POST",
    body: JSON.stringify({ sections }),
  });
}
