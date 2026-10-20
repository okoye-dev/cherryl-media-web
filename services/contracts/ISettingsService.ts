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

export interface ISettingsService {
  getEditorialCopy(): Promise<EditorialCopy>;
  updateEditorialCopy(copy: EditorialCopy): Promise<{ success: boolean }>;
}
