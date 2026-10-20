import type { IApiClient } from "../contracts/IApiClient";
import type {
  IArticleService,
  ArticleQueryParams,
  SlugCheckResult,
  ArticleCandidate,
} from "../contracts/IArticleService";
import type { CanonicalArticle } from "@/lib/types";

export class ArticleService implements IArticleService {
  constructor(private readonly client: IApiClient) {}

  async getArticles(params?: ArticleQueryParams): Promise<CanonicalArticle[]> {
    const queryParams: Record<string, string | number | undefined> = {};
    if (params?.status) queryParams.status = params.status;
    if (params?.q || params?.search) queryParams.q = params.q || params.search;
    if (params?.ids && params.ids.length > 0) queryParams.ids = params.ids.join(",");
    if (params?.limit) queryParams.limit = params.limit;

    return this.client.get<CanonicalArticle[]>("/api/articles", queryParams);
  }

  async getArticleBySlug(slug: string): Promise<CanonicalArticle> {
    return this.client.get<CanonicalArticle>(`/api/articles/${encodeURIComponent(slug)}`);
  }

  async saveArticle(article: Partial<CanonicalArticle>): Promise<CanonicalArticle> {
    return this.client.post<CanonicalArticle>("/api/articles", article);
  }

  async publishArticle(slugOrId: string): Promise<{ success: boolean; article?: CanonicalArticle }> {
    return this.client.post<{ success: boolean; article?: CanonicalArticle }>(
      `/api/articles/${encodeURIComponent(slugOrId)}/publish`
    );
  }

  async checkSlugAvailability(slug: string, excludeId?: string): Promise<SlugCheckResult> {
    const url = typeof window !== "undefined" ? "/api/articles/check-slug" : "/api/articles/check-slug";
    return this.client.get<SlugCheckResult>(url, { slug, excludeId }, { timeoutMs: 4000 });
  }

  async searchTags(query: string): Promise<string[]> {
    const url = typeof window !== "undefined" ? "/api/tags" : "/api/tags";
    const res = await this.client.get<{ tags: string[] }>(url, { q: query }, { timeoutMs: 3000 });
    return Array.isArray(res.tags) ? res.tags : [];
  }

  async searchArticles(query: string, limit = 20): Promise<CanonicalArticle[]> {
    return this.client.get<CanonicalArticle[]>("/api/articles", { q: query, limit }, { timeoutMs: 4000 });
  }

  async getCandidates(): Promise<ArticleCandidate[]> {
    return this.client.get<ArticleCandidate[]>("/api/candidates").catch(() => []);
  }
}
