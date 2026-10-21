const CATEGORY_MAP: Record<string, string> = {
  "state-affairs-environs": "State Affairs & Environs",
  "newsbeat": "Newsbeat",
  "brands-smes": "Brands & SMEs",
  "opinions": "Opinions",
  "sports": "Sports",
  "entertainment-lifestyle": "Entertainment & Lifestyle",
  "education": "Education",
  "thrills-tricks": "Thrills & Tricks",
  "youth-corner": "Youth Corner",
  "tour-hotels": "Tour & Hotels",
  "nigerian-current-affairs": "State Affairs & Environs",
  "practical-nigerian-updates": "Newsbeat",
  "business-institutions": "Brands & SMEs",
  "stories-romance": "Opinions",
  "entertainment-internet-culture": "Entertainment & Lifestyle",
};

export function formatCategoryName(cat?: string): string {
  if (!cat) return "Dispatch";
  const normalized = cat.toLowerCase().trim();
  if (CATEGORY_MAP[normalized]) return CATEGORY_MAP[normalized];

  return cat
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return "14 Oct 2026";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = d.getUTCDate();
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = months[d.getUTCMonth()];
    const year = d.getUTCFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return dateStr;
  }
}

export function formatReadTime(timeStr?: string): string {
  if (!timeStr) return "4min";
  const cleaned = timeStr.replace(/\s*read\.?$/i, "").trim();
  const match = cleaned.match(/^(\d+)\s*min$/i);
  if (match) {
    return `${match[1]}min`;
  }
  return cleaned.replace(/\s+/g, "");
}

type WithAuthor = { author?: string | { name?: string } | null };

export function authorName(article: WithAuthor): string {
  const a = article.author;
  const name = typeof a === "string" ? a : a?.name;
  return (name || "").trim();
}

export const TEAM_BYLINE = "Cherryl Media Team";

export function withStop(title: string): string {
  return /[.!?…]$/.test(title.trim()) ? title : `${title}.`;
}
