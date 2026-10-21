import type { ContentBlock, PillarCategory, PublishingStatus, CanonicalArticle, RelatedStory } from "@/lib/types";
import { cleanTag, MAX_TAGS } from "./tags";

export interface SourceItem {
  url: string;
  publisher: string;
  claimSummary?: string;
}

export interface EditorFields {
  id: string;
  title: string;
  subtitle: string;
  excerpt: string;
  kicker: string;
  slug: string;
  category: PillarCategory;
  authorName: string;
  authorRole: string;
  status: PublishingStatus;
  sendWebpushr: boolean;
  tags: string[];
  coverUrl: string;
  coverCaption: string;
  coverCredit: string;
  blocks: ContentBlock[];
  relatedStories: RelatedStory[];
  seoTitle: string;
  seoSlug: string;
  seoDescription: string;
  xPost: string;
  fbPost: string;
  liPost: string;
  nlPost: string;
  sources: SourceItem[];
}

const DEFAULT_KICKER = "NEWSROOM · DESK DISPATCH";
const DEFAULT_CATEGORY: PillarCategory = "state-affairs-environs";
const DEFAULT_CREDIT = "Cherryl Media";

export const EMPTY_FIELDS: EditorFields = {
  id: "",
  title: "",
  subtitle: "",
  excerpt: "",
  kicker: DEFAULT_KICKER,
  slug: "",
  category: DEFAULT_CATEGORY,
  authorName: "",
  authorRole: "",
  status: "draft",
  sendWebpushr: false,
  tags: ["Nigeria"],
  coverUrl: "",
  coverCaption: "",
  coverCredit: DEFAULT_CREDIT,
  blocks: [{ order_id: 1, type: "paragraph", text: "", isDropCap: true }],
  relatedStories: [],
  seoTitle: "",
  seoSlug: "",
  seoDescription: "",
  xPost: "",
  fbPost: "",
  liPost: "",
  nlPost: "",
  sources: [],
};

export const NEW_STORY_FIELDS: EditorFields = {
  ...EMPTY_FIELDS,
  blocks: [{ order_id: 1, type: "paragraph", isDropCap: true, text: "Draft your opening paragraph here..." }],
};

const str = (v: unknown, fallback = "") => (typeof v === "string" ? v : fallback);
const numbered = <T extends { order_id?: number }>(items: T[]) => items.map((b, i) => ({ ...b, order_id: i + 1 }));
const cleanTags = (tags: unknown) =>
  Array.isArray(tags) ? tags.map(cleanTag).filter(Boolean).slice(0, MAX_TAGS) : [];

export function slugFromTitle(title: string, max = 90): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, max)
    .replace(/-+$/g, "");
}

/** Fields for a story fetched from the backend. */
export function fieldsFromArticle(art: Partial<CanonicalArticle> & Record<string, unknown>): EditorFields {
  const author = art.author as { name?: string; role?: string } | undefined;
  const cover = art.featuredImage as { url?: string; caption?: string; credit?: string } | undefined;
  const social = (art.socialVariants || art.channelVariants) as Record<string, string> | undefined;
  const rawBlocks = Array.isArray(art.body) ? (art.body as ContentBlock[]) : [];
  const rawRelated = Array.isArray(art.related_stories) ? (art.related_stories as RelatedStory[]) : [];
  const rawSources =
    ((art.sources || art.sourceLinks) as Array<{
      url?: string;
      publisher?: string;
      sourceName?: string;
      claimSummary?: string;
    }>) || [];

  return {
    id: str(art.id),
    title: str(art.title),
    subtitle: str(art.subtitle),
    excerpt: typeof art.excerpt === "string" && art.excerpt ? art.excerpt : str(art.deck),
    kicker: str(art.kicker, DEFAULT_KICKER),
    slug: str(art.slug),
    category: (art.category as PillarCategory) || DEFAULT_CATEGORY,
    authorName: author?.name || "",
    authorRole: author?.role || "",
    status: (art.status as PublishingStatus) || "published",
    sendWebpushr: Boolean(art.send_webpushr),
    tags: cleanTags(art.tags),
    coverUrl: cover?.url || "",
    coverCaption: cover?.caption || "",
    coverCredit: cover?.credit || DEFAULT_CREDIT,
    blocks: rawBlocks.map((b, i) => ({ ...b, order_id: b.order_id || i + 1 })),
    relatedStories: rawRelated.map((b, i) => ({ ...b, order_id: b.order_id || i + 1 })),
    seoTitle: str(art.seo_title),
    seoSlug: str(art.seo_slug),
    seoDescription: str(art.seo_description),
    xPost: social?.x || "",
    fbPost: social?.facebook || "",
    liPost: social?.linkedin || "",
    nlPost: social?.newsletter || "",
    sources: rawSources.map((s) => ({
      url: s.url || "",
      publisher: s.publisher || s.sourceName || "Source Gazette",
      claimSummary: s.claimSummary || "",
    })),
  };
}

/** Fields for a saved version. Keeps the current id, and drops SEO values that only repeat the title, slug or excerpt. */
export function fieldsFromPayload(p: Partial<CanonicalArticle>, currentId: string, currentStatus: PublishingStatus): EditorFields {
  const excerpt = str(p.excerpt) || str(p.deck);
  const rawBlocks = Array.isArray(p.body) ? p.body : [];
  const rawRelated = Array.isArray(p.related_stories) ? p.related_stories : [];
  const social = p.socialVariants;
  return {
    id: currentId,
    title: str(p.title),
    subtitle: str(p.subtitle),
    excerpt: excerpt === str(p.subtitle) ? "" : excerpt,
    kicker: str(p.kicker, DEFAULT_KICKER),
    slug: str(p.slug),
    category: (p.category as PillarCategory) || DEFAULT_CATEGORY,
    authorName: p.author?.name || "",
    authorRole: p.author?.role || "",
    status: currentStatus,
    sendWebpushr: Boolean(p.send_webpushr),
    tags: cleanTags(p.tags),
    coverUrl: p.featuredImage?.url || "",
    coverCaption: p.featuredImage?.caption || "",
    coverCredit: p.featuredImage?.credit || DEFAULT_CREDIT,
    blocks:
      rawBlocks.length > 0
        ? numbered(rawBlocks)
        : [{ order_id: 1, type: "paragraph", text: "", isDropCap: true }],
    relatedStories: numbered(rawRelated),
    seoTitle: p.seo_title && p.seo_title !== p.title ? p.seo_title : "",
    seoSlug: p.seo_slug && p.seo_slug !== p.slug ? p.seo_slug : "",
    seoDescription: p.seo_description && p.seo_description !== (p.excerpt || p.subtitle) ? p.seo_description : "",
    xPost: social?.x || "",
    fbPost: social?.facebook || "",
    liPost: social?.linkedin || "",
    nlPost: social?.newsletter || "",
    sources: (p.sources || []).map((s) => ({
      url: s.url || "",
      publisher: s.sourceName || "",
      claimSummary: s.claimSummary || "",
    })),
  };
}

export function buildPayload(f: EditorFields): Partial<CanonicalArticle> {
  return {
    id: f.id || undefined,
    title: f.title,
    subtitle: f.subtitle,
    excerpt: f.excerpt || f.subtitle,
    deck: f.excerpt || f.subtitle,
    kicker: f.kicker,
    slug: f.slug || f.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    category: f.category,
    categoryName: f.category.replace(/-/g, " ").toUpperCase(),
    author: { name: f.authorName, role: f.authorRole },
    featuredImage: { url: f.coverUrl, caption: f.coverCaption, credit: f.coverCredit },
    readTime: "4 min read",
    status: f.status,
    send_webpushr: f.sendWebpushr,
    tags: f.tags,
    seo_title: f.seoTitle || f.title,
    seo_slug: f.seoSlug || f.slug,
    seo_description: f.seoDescription || f.excerpt || f.subtitle,
    body: numbered(f.blocks),
    related_stories: numbered(f.relatedStories),
    socialVariants: { x: f.xPost, facebook: f.fbPost, linkedin: f.liPost, newsletter: f.nlPost },
    sources: f.sources.map((s) => ({ sourceName: s.publisher, url: s.url, claimSummary: s.claimSummary || "" })),
    publishedAt: new Date().toISOString(),
  };
}

/** The payload as a string, without fields that change by themselves. */
export function snapshotOf(p: Partial<CanonicalArticle>): string {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { publishedAt, readTime, ...rest } = p;
  return JSON.stringify(rest);
}

export function buildAIBrief(f: EditorFields): string {
  const body = f.blocks
    .map((b) => {
      if (b.type === "paragraph") return `[#${b.order_id}] ${b.text}`;
      if (b.type === "heading") return `[#${b.order_id}] ### ${b.text}`;
      if (b.type === "quote") return `[#${b.order_id}] > "${b.quote}"\n> — ${b.author} (${b.context})`;
      if (b.type === "external_link") return `[#${b.order_id}] [Link: ${b.title} - ${b.url}]`;
      if (b.type === "internal_link") return `[#${b.order_id}] [Internal Story: ${b.title} - ${b.slug}]`;
      if (b.type === "image") return `[#${b.order_id}] [Photo: ${b.caption || b.alt} (${b.src})]`;
      return "";
    })
    .filter(Boolean)
    .join("\n\n");
  const sources =
    f.sources
      .map((s, i) => `${i + 1}. **${s.publisher}**\n   - URL: ${s.url}\n   - Verified Claim: ${s.claimSummary || "Primary report"}`)
      .join("\n\n") || "No external sources attached yet.";

  return `# EDITORIAL CONTEXT & SOURCE BRIEF FOR FACT-CHECKING / REFINEMENT

## TITLE: ${f.title}
## SUBTITLE: ${f.subtitle}
## EXCERPT / DECK: ${f.excerpt}
## CATEGORY: ${f.category}
## AUTHOR: ${f.authorName} (${f.authorRole})
## TAGS: ${f.tags.join(", ") || "None"}

### PRIMARY SOURCES & CITATIONS:
${sources}

### FULL ARTICLE BODY:
${body}

### SOCIAL MEDIA CHANNELS DRAFTS:
- X / Twitter: ${f.xPost || "None drafted yet"}
- Facebook: ${f.fbPost || "None drafted yet"}
- LinkedIn: ${f.liPost || "None drafted yet"}
- Newsletter: ${f.nlPost || "None drafted yet"}
`;
}
