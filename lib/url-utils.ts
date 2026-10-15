export function isInternalUrl(url: string): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (trimmed.startsWith("/") || trimmed.startsWith("#") || trimmed.startsWith("./")) {
    return true;
  }
  try {
    const parsed = new URL(trimmed);
    const hostname = parsed.hostname.toLowerCase();
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.includes("cherryl") ||
      hostname.endsWith(".local")
    );
  } catch {
    return !trimmed.includes("://");
  }
}

export function normalizeStoryPath(url: string): string {
  if (!url) return "/";
  try {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      const parsed = new URL(url);
      return parsed.pathname;
    }
  } catch {}
  return url.startsWith("/") ? url : `/${url}`;
}
