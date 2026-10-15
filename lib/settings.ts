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
  network: {
    headline: string;
    subheadline: string;
    subscribers: string;
    reachMonthly: string;
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
    customNotice:
      "BREAKING: Federal Executive Council ratifies state electricity market guidelines and sovereign payment assurance frameworks.",
  },
  dossier: {
    issueBadge: "WEEKEND EDITION · ISSUE #18",
    heading: "Culture, Cinema & In-Depth Features",
    subheading:
      "Features, music chronicles, food heritage, and modern narratives across Africa and the diaspora.",
  },
  network: {
    headline: "Multi-Channel Media Distribution Network",
    subheadline:
      "Reach over 250,000+ readers and professionals daily across West Africa and the diaspora through verified news channels.",
    subscribers: "250,000+",
    reachMonthly: "1.8M+",
  },
  footer: {
    tagline: "New-Age Media Distribution & Independent Journalism",
    locations: "Abuja · Lagos · London",
    contactEmail: "newsroom@cherrylmedia.com",
    copyrightNotice: "© 2026 Cherryl Media Enterprise. All rights reserved.",
  },
};

export async function getEditorialCopy(): Promise<EditorialCopy> {
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.BACKEND_URL;

  // During local build/prerendering without a live server, return default copy cleanly
  if (!backendUrl || backendUrl.includes("localhost") || backendUrl.includes("127.0.0.1")) {
    return DEFAULT_EDITORIAL_COPY;
  }

  try {

    const res = await fetch(`${backendUrl}/api/settings`, {
      next: { revalidate: 60 },
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.editorial_copy) {
        return {
          hero: { ...DEFAULT_EDITORIAL_COPY.hero, ...(data.editorial_copy.hero || {}) },
          ticker: { ...DEFAULT_EDITORIAL_COPY.ticker, ...(data.editorial_copy.ticker || {}) },
          dossier: { ...DEFAULT_EDITORIAL_COPY.dossier, ...(data.editorial_copy.dossier || {}) },
          network: { ...DEFAULT_EDITORIAL_COPY.network, ...(data.editorial_copy.network || {}) },
          footer: { ...DEFAULT_EDITORIAL_COPY.footer, ...(data.editorial_copy.footer || {}) },
        };
      }
    }
  } catch {}

  return DEFAULT_EDITORIAL_COPY;
}
