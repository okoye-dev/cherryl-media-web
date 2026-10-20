import type { CanonicalArticle } from "@/lib/types";

export interface SlugCheckResult {
  slug: string;
  available: boolean;
}

export interface ArticleQueryParams {
  status?: string;
  q?: string;
  search?: string;
  ids?: string[];
  limit?: number;
}

export interface ArticleCandidate {
  id: string;
  headline: string;
  pitch?: string;
  category: string;
  confidence?: string;
  source?: string;
  freshness?: string;
  status: string;
}

export interface IArticleService {
  getArticles(params?: ArticleQueryParams): Promise<CanonicalArticle[]>;
  getArticleBySlug(slug: string): Promise<CanonicalArticle>;
  saveArticle(article: Partial<CanonicalArticle>): Promise<CanonicalArticle>;
  publishArticle(slugOrId: string): Promise<{ success: boolean; article?: CanonicalArticle }>;
  checkSlugAvailability(slug: string, excludeId?: string): Promise<SlugCheckResult>;
  searchTags(query: string): Promise<string[]>;
  searchArticles(query: string, limit?: number): Promise<CanonicalArticle[]>;
  getCandidates(): Promise<ArticleCandidate[]>;
}
