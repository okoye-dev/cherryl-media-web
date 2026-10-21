import { SITE } from "@/config/site";
import { formatCategoryName } from "@/lib/formatters";
import type { ContentBlock, PillarCategory } from "@/lib/types";
import type { LeadCandidate } from "@/services/articles";
import { cleanTag, type SourceItem } from "@/hooks/useArticleEditor";

/** Everything AI can fill in. Every key is optional. */
export interface AiPatch {
  title?: string;
  subtitle?: string;
  excerpt?: string;
  kicker?: string;
  category?: PillarCategory;
  tags?: string[];
  body?: ContentBlock[];
  sources?: SourceItem[];
  seoTitle?: string;
  seoDescription?: string;
  social?: { x?: string; facebook?: string; linkedin?: string; newsletter?: string };
}

export const AI_BLOCK_PREFIX = "ai-";

export function isAiBlock(b: ContentBlock): boolean {
  return typeof b.id === "string" && b.id.startsWith(AI_BLOCK_PREFIX);
}

export function blockKey(b: ContentBlock): string {
  return `block:${b.id ?? ""}`;
}

let blockCounter = 0;
function aiId(): string {
  blockCounter += 1;
  return `${AI_BLOCK_PREFIX}${Date.now().toString(36)}-${blockCounter}`;
}

function paragraphs(texts: string[]): ContentBlock[] {
  return texts
    .map((t) => t.trim())
    .filter(Boolean)
    .map((text, i) => ({ id: aiId(), type: "paragraph" as const, text, isDropCap: i === 0 }));
}

/** Turn whatever the lead or the AI sent into a current category slug. Falls back to the first category. */
export function mapCategory(raw?: string): PillarCategory {
  const fallback = SITE.categories[0].slug as PillarCategory;
  if (!raw) return fallback;
  const lower = raw.toLowerCase().trim();
  const bySlug = SITE.categories.find((c) => c.slug === lower);
  if (bySlug) return bySlug.slug as PillarCategory;
  // formatCategoryName resolves legacy slugs (for example business-institutions) to a current name
  const names = [formatCategoryName(raw).toLowerCase(), lower];
  const byName = SITE.categories.find((c) => names.includes(c.name.toLowerCase()) || names.includes(c.shortName.toLowerCase()));
  return (byName?.slug ?? fallback) as PillarCategory;
}

export function leadToPatch(lead: LeadCandidate): AiPatch {
  const patch: AiPatch = {
    title: lead.headline,
    category: mapCategory(lead.category),
  };
  if (lead.pitch) {
    patch.subtitle = lead.pitch;
    patch.excerpt = lead.pitch;
  }
  if (lead.sources && lead.sources.length > 0) {
    patch.sources = lead.sources.map((s) => ({
      publisher: s.sourceName || "",
      url: s.url || "",
      claimSummary: s.claimSummary || "",
    }));
  }
  if (lead.suggestedDraft && lead.suggestedDraft.length > 0) {
    patch.body = lead.suggestedDraft.map((b) => ({ ...b, id: aiId() }));
  } else if (lead.extractedFacts && lead.extractedFacts.length > 0) {
    patch.body = paragraphs(lead.extractedFacts);
  }
  return patch;
}

export const EXPECTED_FORMAT = `{
  "title": "Headline",
  "subtitle": "Second line",
  "excerpt": "One or two sentences for cards",
  "kicker": "Short label above the headline",
  "category": "newsbeat",
  "tags": ["tag one", "tag two"],
  "body": ["First paragraph", "Second paragraph"],
  "sources": [{ "publisher": "Name", "url": "https://...", "claimSummary": "What it confirms" }],
  "seoTitle": "Title for Google",
  "seoDescription": "Summary for Google",
  "social": { "x": "", "facebook": "", "linkedin": "", "newsletter": "" }
}`;

export function expectedFormatPrompt(): string {
  const slugs = SITE.categories.map((c) => c.slug).join(", ");
  return `Reply with JSON only, in this shape. Every key is optional. "category" must be one of: ${slugs}. "body" is a list of paragraphs.\n\n${EXPECTED_FORMAT}`;
}

const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);

export type ParseResult = { ok: true; patch: AiPatch } | { ok: false; error: string };

/** Parse pasted AI output. Accepts plain JSON or JSON inside a fenced block. Never throws. */
export function parsePastedJson(text: string): ParseResult {
  const raw = text.trim();
  if (!raw) return { ok: false, error: "Paste the JSON from your AI first." };
  let candidate = raw;
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) candidate = fenced[1].trim();
  else {
    const a = raw.indexOf("{");
    const b = raw.lastIndexOf("}");
    if (a >= 0 && b > a) candidate = raw.slice(a, b + 1);
  }
  let data: unknown;
  try {
    data = JSON.parse(candidate);
  } catch {
    return { ok: false, error: "That is not valid JSON. Paste only the JSON from the AI reply." };
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { ok: false, error: "Expected a JSON object with keys like title and body." };
  }
  const d = data as Record<string, unknown>;
  const patch: AiPatch = {};
  patch.title = str(d.title);
  patch.subtitle = str(d.subtitle);
  patch.excerpt = str(d.excerpt);
  patch.kicker = str(d.kicker);
  patch.seoTitle = str(d.seoTitle);
  patch.seoDescription = str(d.seoDescription);
  if (str(d.category)) patch.category = mapCategory(str(d.category));
  if (Array.isArray(d.tags)) {
    const tags = d.tags
      .map((t) => (typeof t === "string" ? cleanTag(t) : ""))
      .filter(Boolean);
    if (tags.length) patch.tags = tags;
  }
  if (Array.isArray(d.body) || typeof d.body === "string") {
    const list = Array.isArray(d.body)
      ? d.body.filter((x): x is string => typeof x === "string")
      : (d.body as string).split(/\n\s*\n/);
    const blocks = paragraphs(list);
    if (blocks.length) patch.body = blocks;
  }
  if (Array.isArray(d.sources)) {
    const sources = d.sources
      .filter((s): s is Record<string, unknown> => Boolean(s) && typeof s === "object")
      .map((s) => ({
        publisher: str(s.publisher) || str(s.sourceName) || "",
        url: str(s.url) || "",
        claimSummary: str(s.claimSummary) || "",
      }))
      .filter((s) => s.publisher || s.url);
    if (sources.length) patch.sources = sources;
  }
  if (d.social && typeof d.social === "object") {
    const so = d.social as Record<string, unknown>;
    const social = { x: str(so.x), facebook: str(so.facebook), linkedin: str(so.linkedin), newsletter: str(so.newsletter) };
    if (Object.values(social).some(Boolean)) patch.social = social;
  }
  (Object.keys(patch) as (keyof AiPatch)[]).forEach((k) => patch[k] === undefined && delete patch[k]);
  if (Object.keys(patch).length === 0) return { ok: false, error: "No known fields found. Check the expected format." };
  return { ok: true, patch };
}
