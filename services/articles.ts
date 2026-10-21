import { request, requestPaged, type Paged } from "./api-client";
import type { CanonicalArticle } from "@/lib/types";

export interface SlugCheckResult {
  slug: string;
  available: boolean;
}

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

export async function fetchArticlesByIds(ids: string[]): Promise<CanonicalArticle[]> {
  if (ids.length === 0) return [];
  return request<CanonicalArticle[]>("/api/articles", { params: { ids: ids.join(",") }, cache: "no-store" });
}

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
  return request<SlugCheckResult>("/api/articles/check-slug", {
    params: { slug, excludeId },
    timeoutMs: 15000,
  });
}

export async function searchTags(query: string): Promise<string[]> {
  const res = await request<{ tags: string[] }>("/api/tags", {
    params: { q: query },
    timeoutMs: 15000,
  });
  return Array.isArray(res.tags) ? res.tags : [];
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

export async function setFeatured(idOrSlug: string, isFeatured: boolean): Promise<void> {
  await request(`/api/articles/${encodeURIComponent(idOrSlug)}/featured`, {
    method: "POST",
    body: JSON.stringify({ isFeatured }),
  });
}
