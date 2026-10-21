import type { Metadata } from "next";
import { SITE } from "@/config/site";
import { authorName, TEAM_BYLINE } from "@/lib/formatters";
import type { CanonicalArticle } from "@/lib/types";

export function articleMetadata(article: CanonicalArticle | null): Metadata {
  if (!article) return { title: `Dispatch Not Found | ${SITE.name}` };

  const url = `${SITE.url}/article/${article.slug}`;
  return {
    title: `${article.title} | ${SITE.name}`,
    description: article.deck,
    alternates: { canonical: url },
    openGraph: {
      title: article.title,
      description: article.deck,
      url,
      siteName: SITE.name,
      locale: "en_NG",
      type: "article",
      publishedTime: article.publishedAt,
      authors: [authorName(article) || TEAM_BYLINE],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.deck,
      creator: "@cherrylmedia",
    },
  };
}

export function articleJsonLd(article: CanonicalArticle) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.deck,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    author: [
      authorName(article)
        ? { "@type": "Person", name: authorName(article), jobTitle: article.author.role || undefined }
        : { "@type": "Organization", name: TEAM_BYLINE },
    ],
    publisher: {
      "@type": "NewsMediaOrganization",
      name: SITE.name,
      url: SITE.url,
      logo: { "@type": "ImageObject", url: `${SITE.url}/favicon.ico` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE.url}/article/${article.slug}` },
  };
}
