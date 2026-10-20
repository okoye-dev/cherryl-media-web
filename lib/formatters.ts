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
  // Legacy aliases
  "nigerian-current-affairs": "State Affairs & Environs",
  "practical-nigerian-updates": "Newsbeat",
  "business-institutions": "Brands & SMEs",
  "stories-romance": "Opinions",
  "entertainment-internet-culture": "Entertainment & Lifestyle",
};

/** Formats a category slug or raw title into clean editorial display text */
export function formatCategoryName(cat?: string): string {
  if (!cat) return "Dispatch";
  const normalized = cat.toLowerCase().trim();
  if (CATEGORY_MAP[normalized]) return CATEGORY_MAP[normalized];

  // Capitalize hyphenated words if not in map
  return cat
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** Formats ISO dates into clean editorial format: "14 Oct 2026" */
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

/** Formats read time to compact format without 'read' (e.g. "4 min read" -> "4min") */
export function formatReadTime(timeStr?: string): string {
  if (!timeStr) return "4min";
  const cleaned = timeStr.replace(/\s*read\.?$/i, "").trim();
  const match = cleaned.match(/^(\d+)\s*min$/i);
  if (match) {
    return `${match[1]}min`;
  }
  return cleaned.replace(/\s+/g, "");
}
