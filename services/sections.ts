import { request } from "./api-client";
import { readWithRetry } from "@/lib/fetch-retry";
import { buildFallbackSections, enforceSectionLimits, mergeLegacySections } from "@/lib/sections";
import type { CuratedSectionsResponse } from "@/config/sections";
import type { CanonicalArticle } from "@/lib/types";

export async function fetchCuratedSections(): Promise<CuratedSectionsResponse> {
  // On the server (public pages) a failed read is retried, and if it keeps failing it throws, so the
  // last good page stays up instead of an empty one being saved. In the browser it falls back to empty.
  if (typeof window === "undefined") {
    const data = await readWithRetry<CuratedSectionsResponse>("fetchCuratedSections", async () => {
      const res = await request<CuratedSectionsResponse>("/api/sections", { next: { revalidate: 30 }, timeoutMs: 25000 });
      return res && res.byKey && Array.isArray(res.sections) ? res : null;
    });
    return data ? enforceSectionLimits(mergeLegacySections(data)) : buildFallbackSections();
  }
  try {
    const data = await request<CuratedSectionsResponse>("/api/sections", { timeoutMs: 15000 });
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

