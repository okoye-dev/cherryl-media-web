import { request } from "./api-client";
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

export async function fetchArticleBySlug(slug: string): Promise<CanonicalArticle> {
  return request<CanonicalArticle>(`/api/articles/${encodeURIComponent(slug)}`);
}

export async function saveArticle(article: Partial<CanonicalArticle>): Promise<CanonicalArticle> {
  return request<CanonicalArticle>("/api/articles", {
    method: "POST",
    body: JSON.stringify(article),
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
