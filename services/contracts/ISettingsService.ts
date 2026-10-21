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

export interface ISettingsService {
  getEditorialCopy(): Promise<EditorialCopy>;
  updateEditorialCopy(copy: EditorialCopy): Promise<EditorialCopy>;
  /** Saves only the changed fields. Resolves with the whole stored copy. */
  patchEditorialCopy(changes: Partial<{ [K in keyof EditorialCopy]: Partial<EditorialCopy[K]> }>): Promise<EditorialCopy>;
}
