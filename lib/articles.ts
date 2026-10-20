// Canonical Article Client - Connected directly to Cherryl Media Engine & PostgreSQL DB
import type { CanonicalArticle } from "./types";
import { BACKEND_URL } from "./backend-url";

// Empty array for backward compatibility; all data is fetched live from the database.
export const CANONICAL_ARTICLES: CanonicalArticle[] = [];

export async function getAllArticles(): Promise<CanonicalArticle[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(`${BACKEND_URL}/api/articles?status=published&limit=50`, {
      next: { revalidate: 30 },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data as CanonicalArticle[];
      }
    }
  } catch (err) {
    console.warn("getAllArticles error:", err);
  }
  return [];
}

export async function getLeadStory(): Promise<CanonicalArticle | null> {
  try {
    // 1. Query decision engine featured story
    const res = await fetch(`${BACKEND_URL}/api/articles/featured`, {
      next: { revalidate: 30 },
    });
    if (res.ok) {
      const featured = await res.json();
      if (featured && featured.slug) {
        return featured as CanonicalArticle;
      }
    }
  } catch {}

  // 2. Fallback to latest lead story or first published story in database
  const all = await getAllArticles();
  const lead = all.find((a) => a.isLead);
  return lead || all[0] || null;
}

export async function getDispatches(): Promise<CanonicalArticle[]> {
  const all = await getAllArticles();
  return all.filter((a) => !a.isLead);
}

export async function getOpinionColumns(): Promise<CanonicalArticle[]> {
  const all = await getAllArticles();
  return all.filter(
    (a) => a.category === "opinions" || a.category === "brands-smes"
  );
}

export async function getArticleBySlug(slug: string): Promise<CanonicalArticle | null> {
  const normalized = slug.trim().toLowerCase();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(`${BACKEND_URL}/api/articles/${encodeURIComponent(normalized)}`, {
      next: { revalidate: 30 },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data && data.slug) {
        return data as CanonicalArticle;
      }
    }
  } catch (err) {
    console.warn(`getArticleBySlug(${normalized}) error:`, err);
  }

  return null;
}

export async function getAllArticleSlugs(): Promise<string[]> {
  const all = await getAllArticles();
  return all.map((a) => a.slug);
}

export async function getArticlesByCategory(category: string): Promise<CanonicalArticle[]> {
  const all = await getAllArticles();
  const cat = category.toLowerCase().trim();
  return all.filter(
    (a) =>
      a.category?.toLowerCase() === cat ||
      a.categoryName?.toLowerCase() === cat ||
      a.category?.toLowerCase().replace(/[^a-z0-9]+/g, "-") === cat
  );
}
