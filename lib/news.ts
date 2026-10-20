import {
  CANONICAL_ARTICLES,
  getLeadStory as getLeadArticle,
  getDispatches as getArticleDispatches,
  getArticleBySlug as findArticleBySlug,
  getAllArticleSlugs as findAllArticleSlugs,
  getArticlesByCategory as findArticlesByCategory,
} from "./articles";
import type { CanonicalArticle } from "./types";

export type EditorialArticle = CanonicalArticle;

export async function getLeadStory(): Promise<CanonicalArticle> {
  return getLeadArticle();
}

export async function getDispatches(): Promise<CanonicalArticle[]> {
  return getArticleDispatches();
}

export async function getOpinionColumns(): Promise<CanonicalArticle[]> {
  return CANONICAL_ARTICLES.filter(
    (a) => a.category === "opinions" || a.category === "brands-smes"
  );
}

export async function getAllArticles(): Promise<CanonicalArticle[]> {
  return CANONICAL_ARTICLES;
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
