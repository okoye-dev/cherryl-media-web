import { request } from "./api-client";

export interface EditorialCopy {
  hero: {
    editionBadge: string;
    titleLead: string;
    titleAccent: string;
    titleTrail: string;
    description: string;
  };
  ticker: {
    label: string;
    customNotice: string;
  };
  dossier: {
    issueBadge: string;
    heading: string;
    subheading: string;
  };
  footer: {
    tagline: string;
    locations: string;
    contactEmail: string;
    copyrightNotice: string;
  };
}

export const DEFAULT_EDITORIAL_COPY: EditorialCopy = {
  hero: {
    editionBadge: "DAILY EDITION",
    titleLead: "Independent ",
    titleAccent: "journalism",
    titleTrail: " & digital media network.",
    description:
      "Leading digital newsroom and new-age media distribution network covering state affairs, business, culture, politics, and dispatches across Africa and globally.",
  },
  ticker: {
    label: "LIVE WIRE",
    customNotice: "",
  },
  dossier: {
    issueBadge: "WEEKEND EDITION · ISSUE #18",
    heading: "Culture, Cinema & In-Depth Features",
    subheading:
      "Features, music chronicles, food heritage, and modern narratives across Africa and the diaspora.",
  },
  footer: {
    tagline: "New-Age Media Distribution & Independent Journalism",
    locations: "Abuja · Lagos · London",
    contactEmail: "newsroom@cherrylmedia.com",
    copyrightNotice: "© 2026 Cherryl Media Enterprise. All rights reserved.",
  },
};

export async function fetchEditorialCopy(): Promise<EditorialCopy> {
  try {
    const data = await request<{ editorial_copy?: Partial<EditorialCopy> }>("/api/settings", {
      next: { revalidate: 60 },
      timeoutMs: 15000,
    });
    if (data && data.editorial_copy) {
      return {
        hero: { ...DEFAULT_EDITORIAL_COPY.hero, ...(data.editorial_copy.hero || {}) },
        ticker: { ...DEFAULT_EDITORIAL_COPY.ticker, ...(data.editorial_copy.ticker || {}) },
        dossier: { ...DEFAULT_EDITORIAL_COPY.dossier, ...(data.editorial_copy.dossier || {}) },
        footer: { ...DEFAULT_EDITORIAL_COPY.footer, ...(data.editorial_copy.footer || {}) },
      };
    }
  } catch {
    // Return fallback copy cleanly
  }
  return DEFAULT_EDITORIAL_COPY;
}

/** Saves the site text. Resolves with the copy as stored. Rejects with an ApiError: status 400 carries `data.fields` (path to message). */
export async function updateEditorialCopy(copy: EditorialCopy): Promise<EditorialCopy> {
  const res = await request<{ editorial_copy?: Partial<EditorialCopy> }>("/api/settings/editorial-copy", {
    method: "PUT",
    body: JSON.stringify(copy),
  });
  return mergeCopy(res.editorial_copy);
}

function mergeCopy(c?: Partial<EditorialCopy>): EditorialCopy {
  return {
    hero: { ...DEFAULT_EDITORIAL_COPY.hero, ...(c?.hero || {}) },
    ticker: { ...DEFAULT_EDITORIAL_COPY.ticker, ...(c?.ticker || {}) },
    dossier: { ...DEFAULT_EDITORIAL_COPY.dossier, ...(c?.dossier || {}) },
    footer: { ...DEFAULT_EDITORIAL_COPY.footer, ...(c?.footer || {}) },
  };
}

/** Saves only the changed fields, for example { footer: { tagline: "..." } }. Resolves with the whole stored copy. */
export async function patchEditorialCopy(changes: Partial<{ [K in keyof EditorialCopy]: Partial<EditorialCopy[K]> }>): Promise<EditorialCopy> {
  const res = await request<{ editorial_copy?: Partial<EditorialCopy> }>("/api/settings/editorial-copy", {
    method: "PATCH",
    body: JSON.stringify(changes),
  });
  return mergeCopy(res.editorial_copy);
}
