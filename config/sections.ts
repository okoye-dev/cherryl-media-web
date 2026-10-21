import type { CanonicalArticle } from "@/lib/types";

export interface CuratedSection {
  sectionKey: string;
  articleIds: string[];
  articles: CanonicalArticle[];
  metadata?: Record<string, unknown>;
  updatedAt?: string;
}

export interface CuratedSectionsResponse {
  sections: CuratedSection[];
  byKey: Record<string, CuratedSection>;
}

export const SECTION_METADATA: Record<
  string,
  { title: string; subtitle: string; maxSlots: number; showsImage: boolean; categoryHint?: string }
> = {
  hero_lead: {
    title: "Top story",
    subtitle: "The large featured story at the very top of the homepage",
    maxSlots: 1,
    showsImage: true,
  },
  hero_trending: {
    title: "Trending stories",
    subtitle: "The list beside the top story, in the order shown",
    maxSlots: 3,
    showsImage: false,
  },
  state_affairs: {
    title: "State Affairs & Environs",
    subtitle: "The picture cards in the State Affairs section",
    maxSlots: 4,
    showsImage: true,
    categoryHint: "state-affairs-environs",
  },
  perspectives: {
    title: "Opinions & Perspectives",
    subtitle: "The opinions list next to State Affairs",
    maxSlots: 3,
    showsImage: false,
    categoryHint: "opinions",
  },
  brands_smes: {
    title: "Brands & SMEs",
    subtitle: "The picture cards in the Brands & SMEs section",
    maxSlots: 3,
    showsImage: true,
    categoryHint: "brands-smes",
  },
  dossier_lead: {
    title: "Culture: main feature",
    subtitle: "The large card on the left of the Culture section",
    maxSlots: 1,
    showsImage: true,
  },
  dossier_side: {
    title: "Culture: side cards",
    subtitle: "The two cards in the middle of the Culture section, top to bottom",
    maxSlots: 2,
    showsImage: false,
  },
  dossier_radar: {
    title: "Culture briefs",
    subtitle: "The short list on the right of the Culture section",
    maxSlots: 4,
    showsImage: false,
  },
};

export const DEFAULT_SECTION_KEYS = Object.keys(SECTION_METADATA);
