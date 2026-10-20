import {
  getAllArticles as findAllArticles,
  getLeadStory as getLeadArticle,
  getDispatches as getArticleDispatches,
  getArticleBySlug as findArticleBySlug,
  getAllArticleSlugs as findAllArticleSlugs,
  getArticlesByCategory as findArticlesByCategory,
} from "./articles";
import type { CanonicalArticle } from "./types";

export type EditorialArticle = CanonicalArticle;

export async function getLeadStory(): Promise<CanonicalArticle | null> {
  return getLeadArticle();
}

export async function getDispatches(): Promise<CanonicalArticle[]> {
  return getArticleDispatches();
}

export async function getOpinionColumns(): Promise<CanonicalArticle[]> {
  const all = await findAllArticles();
  return all.filter(
    (a) => a.category === "opinions" || a.category === "brands-smes"
  );
}

export async function getAllArticles(): Promise<CanonicalArticle[]> {
  return findAllArticles();
}

export async function getArticleBySlug(slug: string): Promise<CanonicalArticle | null> {
  return findArticleBySlug(slug);
}

export async function getAllArticleSlugs(): Promise<string[]> {
  return findAllArticleSlugs();
}

export async function getArticlesByCategory(category: string): Promise<CanonicalArticle[]> {
  return findArticlesByCategory(category);
}
