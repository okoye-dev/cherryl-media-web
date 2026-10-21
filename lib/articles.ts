// Canonical Article Client - Connected directly to Cherryl Media Engine & PostgreSQL DB
import type { CanonicalArticle } from "./types";
import { BACKEND_URL } from "./backend-url";
import { getJson } from "./fetch-retry";

// Empty array for backward compatibility; all data is fetched live from the database.
export const CANONICAL_ARTICLES: CanonicalArticle[] = [];

export async function getAllArticles(): Promise<CanonicalArticle[]> {
  const res = await getJson<CanonicalArticle[]>("getAllArticles", `${BACKEND_URL}/api/articles?status=published&limit=50`);
  return Array.isArray(res?.data) ? res.data : [];
}

export async function getLeadStory(): Promise<CanonicalArticle | null> {
  // 1. The featured story chosen by the backend. A 404 just means none is featured.
  const featuredRes = await getJson<CanonicalArticle>("getLeadStory", `${BACKEND_URL}/api/articles/featured`);
  if (featuredRes?.data?.slug) return featuredRes.data;

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
  const res = await getJson<CanonicalArticle>(
    `getArticleBySlug(${normalized})`,
    `${BACKEND_URL}/api/articles/${encodeURIComponent(normalized)}`
  );
  return res?.data?.slug ? res.data : null;
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
