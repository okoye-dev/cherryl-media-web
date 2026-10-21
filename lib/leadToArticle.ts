import type { CanonicalArticle, ContentBlock } from "@/lib/types";
import { SITE } from "@/config/site";
import { formatCategoryName } from "@/lib/formatters";

export interface RawLead {
  id?: string;
  headline?: string;
  pitch?: string;
  category?: string;
  relevanceScore?: number;
  sources?: Array<{ sourceName?: string; url?: string; claimSummary?: string }>;
  extractedFacts?: string[];
  suggestedDraft?: ContentBlock[];
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function categorySlugFor(raw?: string): string {
  const name = formatCategoryName(raw);
  const match = SITE.categories.find((c) => c.name === name || c.slug === (raw || "").toLowerCase());
  return (match ?? SITE.categories[0]).slug;
}

function leadBody(lead: RawLead): ContentBlock[] {
  const draft = Array.isArray(lead.suggestedDraft) ? lead.suggestedDraft : [];
  const blocks: ContentBlock[] =
    draft.length > 0
      ? draft
      : (lead.extractedFacts || []).map((text) => ({ type: "paragraph", text }) as ContentBlock);
  return blocks.map((b, i) => ({
    ...b,
    order_id: i + 1,
    ...(b.type === "paragraph" && i === 0 ? { isDropCap: true } : {}),
  })) as ContentBlock[];
}

export function leadToArticle(lead: RawLead): Partial<CanonicalArticle> {
  const title = (lead.headline || "").trim();
  const category = categorySlugFor(lead.category);
  const categoryName = SITE.categories.find((c) => c.slug === category)?.name ?? "";
  const pitch = (lead.pitch || "").trim();
  return {
    title,
    subtitle: pitch,
    excerpt: pitch,
    deck: pitch,
    kicker: categoryName.toUpperCase(),
    slug: slugify(title),
    category: category as CanonicalArticle["category"],
    categoryName,
    author: { name: "", role: "" },
    readTime: "4 min read",
    tags: [],
    seo_title: title,
    seo_slug: slugify(title),
    seo_description: pitch,
    body: leadBody(lead),
    related_stories: [],
    sources: (lead.sources || []).map((s) => ({
      sourceName: s.sourceName || "",
      url: s.url || "",
      claimSummary: s.claimSummary || "",
    })),
    socialVariants: { x: "", facebook: "", linkedin: "", newsletter: "" },
  };
}
