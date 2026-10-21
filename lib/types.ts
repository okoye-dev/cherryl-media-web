export type PillarCategory =
  | "state-affairs-environs"
  | "newsbeat"
  | "brands-smes"
  | "opinions"
  | "sports"
  | "entertainment-lifestyle"
  | "education"
  | "thrills-tricks"
  | "youth-corner"
  | "tour-hotels"
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
  | { id?: string; order_id?: number; type: "paragraph"; text: string; isDropCap?: boolean }
  | { id?: string; order_id?: number; type: "quote"; quote: string; author?: string; context?: string }
  | { id?: string; order_id?: number; type: "image"; src: string; storage_key?: string; storageKey?: string; caption?: string; credit?: string; alt: string; aspectRatio?: string }
  | { id?: string; order_id?: number; type: "video"; src: string; storage_key?: string; storageKey?: string; caption?: string; credit?: string; poster?: string }
  | { id?: string; order_id?: number; type: "youtube"; url: string; caption?: string }
  | { id?: string; order_id?: number; type: "internal_link"; title: string; slug: string; category: string; deck?: string; readTime?: string; imageUrl?: string }
  | { id?: string; order_id?: number; type: "external_link"; title: string; url: string; publisher: string; verified?: boolean }
  | { id?: string; order_id?: number; type: "heading"; level: 2 | 3; text: string };

export interface RelatedStory {
  id?: string;
  order_id?: number;
  type?: "internal_link" | "external_link" | string;
  title: string;
  slug?: string;
  url?: string;
  category?: string;
  deck?: string;
  imageUrl?: string;
  publisher?: string;
}

export interface CanonicalArticle {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
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
  send_webpushr?: boolean;
  seo_title?: string;
  seo_slug?: string;
  seo_description?: string;
  body: ContentBlock[];
  related_stories?: RelatedStory[];
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

