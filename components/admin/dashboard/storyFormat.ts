import type { CanonicalArticle } from "@/lib/types";

export function authorOf(a: CanonicalArticle) {
  return typeof a.author === "string" ? a.author : a.author?.name;
}

export function formatDate(a: CanonicalArticle) {
  const raw = a.updatedAt || a.publishedAt;
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
