import type { CanonicalArticle } from "./types";
import { CANONICAL_ARTICLES } from "./articles";

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

function buildFallbackResponse(): CuratedSectionsResponse {
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
      "12f9e7fb-8019-5edb-80e9-7789a9729176",
      "d2065825-0408-5a7f-b4d0-559be9e67a9a",
      "278198f8-3eee-55ce-8736-dcdd55c46cec",
    ],
    perspectives: [
      "278198f8-3eee-55ce-8736-dcdd55c46cec",
      "d2065825-0408-5a7f-b4d0-559be9e67a9a",
      "f10fad9c-c601-552e-a7b2-816b8c370ecc",
    ],
    dossier_lead: ["f3033f02-9628-52d2-bef4-8b0814c6d835"],
    dossier_soundscapes: ["d641aeae-a6be-50f5-a13c-54c67bbf6e75"],
    dossier_gastronomy: ["0827a7d0-015b-5643-ac3d-4ccced2b933c"],
    dossier_radar: [
      "f2fc6ae3-16ec-51cc-bc8d-c9d2b4e4271f",
      "ee3b36cb-8ce0-5f3c-bfae-3d077b882004",
      "917d0345-9020-50e5-89eb-9cb1721d21fa",
      "33a00b82-fd1f-5437-9317-0c951151d023",
    ],
  };

  const sections: CuratedSection[] = [];
  const byKey: Record<string, CuratedSection> = {};

  for (const [key, ids] of Object.entries(defaultAllocations)) {
    let articles = ids
      .map((id) => byID[id])
      .filter((a): a is CanonicalArticle => Boolean(a));

    if (articles.length === 0) {
      // Safety guarantee: never leave a section empty
      articles = CANONICAL_ARTICLES.slice(0, 4);
    }

    const sec: CuratedSection = {
      sectionKey: key,
      articleIds: ids,
      articles,
      metadata: {},
      updatedAt: new Date().toISOString(),
    };
    sections.push(sec);
    byKey[key] = sec;
  }

  return { sections, byKey };
}

export async function getCuratedSections(): Promise<CuratedSectionsResponse> {
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.BACKEND_URL ||
    "http://localhost:8080";

  const fallback = buildFallbackResponse();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${backendUrl}/api/sections`, {
      next: { revalidate: 30 },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data && data.byKey) {
        // Guarantee all default sections have populated articles
        for (const key of DEFAULT_SECTION_KEYS) {
          if (
            !data.byKey[key] ||
            !Array.isArray(data.byKey[key].articles) ||
            data.byKey[key].articles.length === 0
          ) {
            data.byKey[key] = fallback.byKey[key];
          }
        }
        return data as CuratedSectionsResponse;
      }
    }
  } catch {
    // Graceful fallback to verified canonical dataset if backend is unreachable during build
  }

  return fallback;
}

export async function searchArticles(query: string, limit = 20): Promise<CanonicalArticle[]> {
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.BACKEND_URL ||
    "http://localhost:8080";

  try {
    const res = await fetch(
      `${backendUrl}/api/articles?q=${encodeURIComponent(query)}&limit=${limit}`
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data as CanonicalArticle[];
      }
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
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.BACKEND_URL ||
    "http://localhost:8080";

  try {
    const res = await fetch(`${backendUrl}/api/articles?status=all`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data as CanonicalArticle[];
      }
    }
  } catch {}

  return CANONICAL_ARTICLES;
}

export async function updateCuratedSection(
  sectionKey: string,
  articleIds: string[],
  metadata: Record<string, unknown> = {}
): Promise<boolean> {
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.BACKEND_URL ||
    "http://localhost:8080";

  try {
    const res = await fetch(`${backendUrl}/api/sections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sectionKey,
        articleIds,
        metadata,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function updateAllCuratedSections(
  sections: { sectionKey: string; articleIds: string[]; metadata?: Record<string, unknown> }[]
): Promise<boolean> {
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.BACKEND_URL ||
    "http://localhost:8080";

  try {
    const res = await fetch(`${backendUrl}/api/sections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sections }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
