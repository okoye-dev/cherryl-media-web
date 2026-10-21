import { request, requestPaged, type Paged } from "./api-client";
import type { CanonicalArticle } from "@/lib/types";

export interface SlugCheckResult {
  slug: string;
  available: boolean;
}

export interface TagsResult {
  tags: string[];
}

export interface ArticleQueryParams {
  status?: string;
  q?: string;
  search?: string;
  ids?: string[];
  limit?: number;
}

export async function fetchArticles(params?: ArticleQueryParams): Promise<CanonicalArticle[]> {
  const queryParams: Record<string, string | number | undefined> = {};
  if (params?.status) queryParams.status = params.status;
  if (params?.q || params?.search) queryParams.q = params?.q || params?.search;
  if (params?.ids && params.ids.length > 0) queryParams.ids = params.ids.join(",");
  if (params?.limit) queryParams.limit = params.limit;

  return request<CanonicalArticle[]>("/api/articles", { params: queryParams });
}

/** One page of stories. status is "published", "draft" or "all". Search with q. Page numbers start at 1. */
export async function fetchArticlesPage(params: {
  status?: string;
  q?: string;
  page?: number;
  pageSize?: number;
}): Promise<Paged<CanonicalArticle>> {
  return requestPaged<CanonicalArticle>("/api/articles", {
    params: { status: params.status, q: params.q, page: params.page ?? 1, pageSize: params.pageSize ?? 10 },
    cache: "no-store",
  });
}

/** Just the stories with these ids (a lookup, not a list). */
export async function fetchArticlesByIds(ids: string[]): Promise<CanonicalArticle[]> {
  if (ids.length === 0) return [];
  return request<CanonicalArticle[]>("/api/articles", { params: { ids: ids.join(",") }, cache: "no-store" });
}

/** One page of AI story leads, best first. */
export async function fetchCandidatesPage(params: { page?: number; pageSize?: number }): Promise<Paged<unknown>> {
  return requestPaged<unknown>("/api/candidates", {
    params: { page: params.page ?? 1, pageSize: params.pageSize ?? 8 },
    cache: "no-store",
  });
}

export async function fetchArticleBySlug(slug: string): Promise<CanonicalArticle> {
  return request<CanonicalArticle>(`/api/articles/${encodeURIComponent(slug)}`);
}

export async function saveArticle(article: Partial<CanonicalArticle>): Promise<CanonicalArticle> {
  return request<CanonicalArticle>("/api/articles", {
    method: "POST",
    body: JSON.stringify(article),
  });
}

/**
 * Saves only what changed. The reply says which fields the server actually changed.
 * Use saveArticle for the first save of a new story, then this for every save after.
 */
export async function patchArticle(
  slugOrId: string,
  changes: Partial<CanonicalArticle>
): Promise<{ article: CanonicalArticle; changed: string[] }> {
  return request<{ article: CanonicalArticle; changed: string[] }>(`/api/articles/${encodeURIComponent(slugOrId)}`, {
    method: "PATCH",
    body: JSON.stringify(changes),
  });
}

export async function publishArticle(slugOrId: string): Promise<{ success: boolean; article?: CanonicalArticle }> {
  return request<{ success: boolean; article?: CanonicalArticle }>(
    `/api/articles/${encodeURIComponent(slugOrId)}/publish`,
    { method: "POST" }
  );
}

export async function checkSlugAvailability(slug: string, excludeId?: string): Promise<SlugCheckResult> {
  // Use Next.js internal proxy route for seamless SSR/CSR fallback
  const url = typeof window !== "undefined" ? "/api/articles/check-slug" : "/api/articles/check-slug";
  return request<SlugCheckResult>(url, {
    params: { slug, excludeId },
    timeoutMs: 15000,
  });
}

export async function searchTags(query: string): Promise<string[]> {
  const url = typeof window !== "undefined" ? "/api/tags" : "/api/tags";
  const res = await request<TagsResult>(url, {
    params: { q: query },
    timeoutMs: 15000,
  });
  return Array.isArray(res.tags) ? res.tags : [];
}

export async function searchArticles(query: string, limit = 20): Promise<CanonicalArticle[]> {
  return request<CanonicalArticle[]>("/api/articles", {
    params: { q: query, limit },
    timeoutMs: 15000,
  });
}

export interface LeadCandidate {
  id: string;
  headline: string;
  pitch?: string;
  category?: string;
  relevanceScore?: number;
  sources?: { sourceName?: string; url?: string; claimSummary?: string }[];
  extractedFacts?: string[];
  suggestedDraft?: import("@/lib/types").ContentBlock[];
  status?: string;
}

export async function fetchCandidate(id: string): Promise<LeadCandidate> {
  return request<LeadCandidate>(`/api/candidates/${encodeURIComponent(id)}`);
}
