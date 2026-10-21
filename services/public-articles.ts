import type { CanonicalArticle } from "@/lib/types";
import { BACKEND_URL } from "@/lib/backend-url";
import { getJson } from "@/lib/fetch-retry";

async function getAllArticles(): Promise<CanonicalArticle[]> {
  const res = await getJson<CanonicalArticle[]>("getAllArticles", `${BACKEND_URL}/api/articles?status=published&limit=50`);
  return Array.isArray(res?.data) ? res.data : [];
}

export async function getLeadStory(): Promise<CanonicalArticle | null> {
  // A 404 just means no story is featured.
  const featuredRes = await getJson<CanonicalArticle>("getLeadStory", `${BACKEND_URL}/api/articles/featured`);
  if (featuredRes?.data?.slug) return featuredRes.data;

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
