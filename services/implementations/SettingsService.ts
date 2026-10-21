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
          footer: { ...DEFAULT_EDITORIAL_COPY.footer, ...(data.editorial_copy.footer || {}) },
        };
      }
    } catch {
      // Fallback cleanly
    }
    return DEFAULT_EDITORIAL_COPY;
  }

  async patchEditorialCopy(
    changes: Partial<{ [K in keyof EditorialCopy]: Partial<EditorialCopy[K]> }>
  ): Promise<EditorialCopy> {
    const res = await this.client.request<{ editorial_copy?: Partial<EditorialCopy> }>(
      "/api/settings/editorial-copy",
      { method: "PATCH", body: JSON.stringify(changes) }
    );
    const c = res.editorial_copy;
    return {
      hero: { ...DEFAULT_EDITORIAL_COPY.hero, ...(c?.hero || {}) },
      ticker: { ...DEFAULT_EDITORIAL_COPY.ticker, ...(c?.ticker || {}) },
      dossier: { ...DEFAULT_EDITORIAL_COPY.dossier, ...(c?.dossier || {}) },
      footer: { ...DEFAULT_EDITORIAL_COPY.footer, ...(c?.footer || {}) },
    };
  }

  async updateEditorialCopy(copy: EditorialCopy): Promise<EditorialCopy> {
    const res = await this.client.put<{ editorial_copy?: Partial<EditorialCopy> }>(
      "/api/settings/editorial-copy",
      copy
    );
    const c = res.editorial_copy;
    return {
      hero: { ...DEFAULT_EDITORIAL_COPY.hero, ...(c?.hero || {}) },
      ticker: { ...DEFAULT_EDITORIAL_COPY.ticker, ...(c?.ticker || {}) },
      dossier: { ...DEFAULT_EDITORIAL_COPY.dossier, ...(c?.dossier || {}) },
      footer: { ...DEFAULT_EDITORIAL_COPY.footer, ...(c?.footer || {}) },
    };
  }
}
