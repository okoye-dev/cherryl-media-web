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

export interface ISectionService {
  getCuratedSections(): Promise<CuratedSectionsResponse>;
  updateCuratedSections(
    sections: Array<{ sectionKey: string; articleIds: string[]; metadata?: Record<string, unknown> }>
  ): Promise<{ success: boolean; count?: number }>;
}
