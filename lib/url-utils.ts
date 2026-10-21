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

export function getYouTubeEmbedUrl(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  const match = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (match && match[1]) {
    return `https://www.youtube-nocookie.com/embed/${match[1]}`;
  }
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return `https://www.youtube-nocookie.com/embed/${trimmed}`;
  }
  return null;
}

const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL || "";

export function resolveMediaUrl(urlOrKey?: string): string {
  if (!urlOrKey) return "";
  const trimmed = urlOrKey.trim();

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  if (trimmed.startsWith("/assets/") || trimmed.startsWith("/uploads/")) {
    return trimmed;
  }

  const cleanKey = trimmed.replace(/^\/+/, "");
  if (CDN_URL) {
    return `${CDN_URL.replace(/\/+$/, "")}/${cleanKey}`;
  }

  return `/${cleanKey}`;
}

