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

export function mergeCopy(c?: Partial<EditorialCopy>): EditorialCopy {
  return {
    hero: { ...DEFAULT_EDITORIAL_COPY.hero, ...(c?.hero || {}) },
    ticker: { ...DEFAULT_EDITORIAL_COPY.ticker, ...(c?.ticker || {}) },
    dossier: { ...DEFAULT_EDITORIAL_COPY.dossier, ...(c?.dossier || {}) },
    footer: { ...DEFAULT_EDITORIAL_COPY.footer, ...(c?.footer || {}) },
  };
}
