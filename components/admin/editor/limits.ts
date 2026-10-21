export const LIMITS = {
  title: 160,
  subtitle: 200,
  excerpt: 300,
  kicker: 80,
  slug: 90,
  authorName: 80,
  authorRole: 80,
  tag: 40,
  maxTags: 12,
  coverCaption: 200,
  coverCredit: 80,
  seoTitle: 60,
  seoSlug: 90,
  seoDescription: 160,
  x: 280,
  facebook: 2000,
  linkedin: 3000,
  newsletter: 1500,
  sourcePublisher: 120,
  sourceUrl: 500,
  claimSummary: 300,
  heading: 160,
  quote: 600,
  imageCaption: 200,
  relatedTitle: 160,
} as const;

export function normalizeSlug(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, LIMITS.slug);
}
