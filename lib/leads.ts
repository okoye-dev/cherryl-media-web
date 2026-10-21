import type { RawLead } from "@/lib/leadToArticle";
import { formatCategoryName } from "@/lib/formatters";

export interface StoryLead {
  id: string;
  title: string;
  pitch: string;
  category: string;
  relevance: number | null;
  sources: number;
  facts: number;
  hasDraft: boolean;
  raw?: RawLead;
}

export function toLead(c: RawLead, i: number): StoryLead {
  const score = typeof c.relevanceScore === "number" ? c.relevanceScore : null;
  return {
    id: c.id || `lead-${i}`,
    title: c.headline || "Untitled lead",
    pitch: c.pitch || "",
    category: formatCategoryName(c.category || "General"),
    relevance: score === null ? null : Math.round(score <= 1 ? score * 100 : score),
    sources: Array.isArray(c.sources) ? c.sources.length : 0,
    facts: Array.isArray(c.extractedFacts) ? c.extractedFacts.length : 0,
    hasDraft: Array.isArray(c.suggestedDraft) && c.suggestedDraft.length > 0,
    raw: c,
  };
}
