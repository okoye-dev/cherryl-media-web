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
    title: "Primary Featured Lead Story",
    subtitle: "The flagship anchor headline at the very top of the cherrylmedia homepage",
    maxSlots: 1,
  },
  hero_trending: {
    title: "Featured Trending Stories",
    subtitle: "Top 3 high-impact dispatches flanking the flagship hero story",
    maxSlots: 3,
  },
  state_affairs: {
    title: "State Affairs & Environs",
    subtitle: "Top sub-national governance, state executive budgets, environment, and regional infrastructure (10,000+ archive beat)",
    maxSlots: 4,
    categoryHint: "state-affairs-environs",
  },
  newsbeat: {
    title: "Newsbeat & National Alerts",
    subtitle: "Urgent national alerts, investigative dispatches, and regulatory orders (9,900+ archive beat)",
    maxSlots: 4,
    categoryHint: "newsbeat",
  },
  brands_smes: {
    title: "Brands & SMEs",
    subtitle: "Enterprise growth, commercial trade, market consumer trends, and fintech innovations",
    maxSlots: 3,
    categoryHint: "brands-smes",
  },
  opinions: {
    title: "Opinions & Perspectives",
    subtitle: "Thought leadership, guest columns, economic critiques, and intellectual discourse",
    maxSlots: 3,
    categoryHint: "opinions",
  },
  weekend_dossier: {
    title: "Weekend Cultural Dossier",
    subtitle: "Longform investigative features, film culture, food heritage, and sonic profiles",
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
    state_affairs: [
      "2f405add-8bba-5261-99af-15feaa62754b",
      "25386df5-95e6-50ad-bc4c-3b6db589992d",
      "d41935e4-a14a-555e-85c1-e78d655f4886",
      "93630737-14e4-5cb8-a578-1cb81c7f9fc9",
    ],
    newsbeat: [
      "25386df5-95e6-50ad-bc4c-3b6db589992d",
      "d41935e4-a14a-555e-85c1-e78d655f4886",
      "b5585b9b-9c74-5555-897b-cfd8c0b58e7b",
      "f10fad9c-c601-552e-a7b2-816b8c370ecc",
    ],
    brands_smes: [
      "decd08ac-ef71-54ee-ac58-fd2480c007fa",
      "6df67a6d-e4fb-5b23-a2a0-410a74799052",
      "c1995ecf-38ea-5a9e-8c53-c977792e3a8d",
    ],
    opinions: [
      "6df67a6d-e4fb-5b23-a2a0-410a74799052",
      "c1995ecf-38ea-5a9e-8c53-c977792e3a8d",
      "970ca881-bf9d-5eb0-a540-34444585145b",
    ],
    weekend_dossier: [
      "970ca881-bf9d-5eb0-a540-34444585145b",
      "35588574-ec88-5a81-be90-8c46283c24de",
      "b5585b9b-9c74-5555-897b-cfd8c0b58e7b",
      "1d607e1e-0ca8-51f6-ae18-f2991dbbc1a3",
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
