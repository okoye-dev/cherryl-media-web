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
      return data;
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
