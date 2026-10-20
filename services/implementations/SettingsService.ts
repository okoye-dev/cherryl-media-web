import type { IApiClient } from "../contracts/IApiClient";
import type { ISettingsService, EditorialCopy } from "../contracts/ISettingsService";
import { DEFAULT_EDITORIAL_COPY } from "../settings";

export class SettingsService implements ISettingsService {
  constructor(private readonly client: IApiClient) {}

  async getEditorialCopy(): Promise<EditorialCopy> {
    try {
      const data = await this.client.get<{ editorial_copy?: Partial<EditorialCopy> }>(
        "/api/settings",
        undefined,
        {
          next: { revalidate: 60 },
          timeoutMs: 15000,
        }
      );

      if (data && data.editorial_copy) {
        return {
          hero: { ...DEFAULT_EDITORIAL_COPY.hero, ...(data.editorial_copy.hero || {}) },
          ticker: { ...DEFAULT_EDITORIAL_COPY.ticker, ...(data.editorial_copy.ticker || {}) },
          dossier: { ...DEFAULT_EDITORIAL_COPY.dossier, ...(data.editorial_copy.dossier || {}) },
          network: { ...DEFAULT_EDITORIAL_COPY.network, ...(data.editorial_copy.network || {}) },
          footer: { ...DEFAULT_EDITORIAL_COPY.footer, ...(data.editorial_copy.footer || {}) },
        };
      }
    } catch {
      // Fallback cleanly
    }
    return DEFAULT_EDITORIAL_COPY;
  }

  async updateEditorialCopy(copy: EditorialCopy): Promise<{ success: boolean }> {
    return this.client.post<{ success: boolean }>("/api/settings", { editorial_copy: copy });
  }
}
