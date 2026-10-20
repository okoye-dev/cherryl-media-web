import type { IApiClient } from "../contracts/IApiClient";
import type {
  ISectionService,
  CuratedSectionsResponse,
} from "../contracts/ISectionService";
import { buildFallbackSections, DEFAULT_SECTION_KEYS } from "../sections";

export class SectionService implements ISectionService {
  constructor(private readonly client: IApiClient) {}

  async getCuratedSections(): Promise<CuratedSectionsResponse> {
    const fallback = buildFallbackSections();
    try {
      const data = await this.client.get<CuratedSectionsResponse>("/api/sections", undefined, {
        next: { revalidate: 30 },
        timeoutMs: 3500,
      });

      if (data && data.byKey) {
        for (const key of DEFAULT_SECTION_KEYS) {
          if (
            !data.byKey[key] ||
            !Array.isArray(data.byKey[key].articles) ||
            data.byKey[key].articles.length === 0
          ) {
            data.byKey[key] = fallback.byKey[key];
          }
        }
        return data;
      }
    } catch {
      // Fallback cleanly
    }
    return fallback;
  }

  async updateCuratedSections(
    sections: Array<{ sectionKey: string; articleIds: string[]; metadata?: Record<string, unknown> }>
  ): Promise<{ success: boolean; count?: number }> {
    return this.client.post<{ success: boolean; count?: number }>("/api/sections", { sections });
  }
}
