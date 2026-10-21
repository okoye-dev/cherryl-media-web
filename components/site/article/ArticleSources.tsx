import type { CanonicalArticle } from "@/lib/types";

interface SourceLink {
  title: string;
  url: string;
  publisher?: string;
}

function collectSources(article: CanonicalArticle): SourceLink[] {
  const found: SourceLink[] = [];

  if (Array.isArray(article.sources)) {
    for (const s of article.sources) {
      if (s.url) found.push({ title: s.sourceName || s.claimSummary || s.url, url: s.url, publisher: s.sourceName });
    }
  }
  if (Array.isArray(article.sourceLinks)) {
    for (const s of article.sourceLinks) {
      if (s.url) found.push({ title: s.publisher || s.url, url: s.url, publisher: s.publisher });
    }
  }
  if (Array.isArray(article.body)) {
    for (const b of article.body) {
      if (b.type === "external_link" && b.url) {
        found.push({ title: b.title || b.publisher || b.url, url: b.url, publisher: b.publisher });
      }
    }
  }

  const seen = new Set<string>();
  return found.filter((s) => {
    if (!s.url || seen.has(s.url)) return false;
    seen.add(s.url);
    return true;
  });
}

export default function ArticleSources({ article }: { article: CanonicalArticle }) {
  const sources = collectSources(article);
  if (sources.length === 0) return null;

  return (
    <div className="mt-12 border-t border-ink/10 pt-6">
      <h3 className="label text-[0.72rem] font-semibold tracking-wider text-ink/60 uppercase">Sources</h3>
      <ul className="mt-3.5 space-y-2.5 text-xs text-ink/80">
        {sources.map((src, i) => (
          <li key={i}>
            <a
              href={src.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink/85 underline underline-offset-4 transition-colors hover:text-brand-red break-words"
            >
              {src.title}
            </a>
            {src.publisher && src.publisher !== src.title && <span className="text-ink-soft"> &mdash; {src.publisher}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
