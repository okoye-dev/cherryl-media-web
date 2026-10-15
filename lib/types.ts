export type PillarCategory =
  | "nigerian-current-affairs"
  | "entertainment-internet-culture"
  | "practical-nigerian-updates"
  | "business-institutions"
  | "stories-romance";

export type PublishingStatus =
  | "draft"
  | "in_review"
  | "approved"
  | "scheduled"
  | "published"
  | "rejected";

export type ContentBlock =
  | { type: "paragraph"; text: string; isDropCap?: boolean }
  | { type: "quote"; quote: string; author?: string; context?: string }
  | { type: "image"; src: string; storage_key?: string; storageKey?: string; caption?: string; credit?: string; alt: string; aspectRatio?: string }
  | { type: "video"; src: string; storage_key?: string; storageKey?: string; caption?: string; credit?: string; poster?: string }
  | { type: "youtube"; url: string; caption?: string }
  | { type: "internal_link"; title: string; slug: string; category: string; deck?: string; readTime?: string }
  | { type: "external_link"; title: string; url: string; publisher: string; verified?: boolean }
  | { type: "heading"; level: 2 | 3; text: string };

export interface CanonicalArticle {
  id: string;
  slug: string;
  title: string;
  kicker: string;
  deck: string;
  category: PillarCategory;
  categoryName: string;
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
  featuredImage: {
    url: string;
    storage_key?: string;
    storageKey?: string;
    caption?: string;
    credit?: string;
  };
  readTime: string;
  publishedAt: string;
  createdAt?: string;
  updatedAt?: string;
  status: PublishingStatus;
  urgent?: boolean;
  isLead?: boolean;
  tags?: string[];
  excerpt?: string;
  body: ContentBlock[];
  sourceLinks?: {
    url: string;
    publisher: string;
    accessedAt: string;
  }[];
  sources?: {
    sourceName: string;
    url: string;
    publishedAt?: string;
    claimSummary?: string;
  }[];
  channelVariants?: {
    facebook?: string;
    x?: string;
    linkedin?: string;
    newsletter?: string;
  };
  socialVariants?: {
    facebook?: string;
    x?: string;
    linkedin?: string;
    newsletter?: string;
  };
  [key: string]: unknown;
}


