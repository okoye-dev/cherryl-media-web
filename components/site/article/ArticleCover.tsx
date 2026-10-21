import { resolveMediaUrl } from "@/lib/url-utils";
import type { CanonicalArticle } from "@/lib/types";

export default function ArticleCover({ article }: { article: CanonicalArticle }) {
  const { url, caption, credit } = article.featuredImage;
  return (
    <figure className="mb-12">
      <div className="aspect-[16/9] w-full rounded-2xl bg-paper-deep relative flex items-center justify-center border border-ink/10 text-ink-soft/40 font-display italic text-2xl overflow-hidden">
        {url && !url.includes("sample.webp") ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={resolveMediaUrl(url)} alt={article.title} className="h-full w-full object-cover" />
        ) : (
          <span className="max-w-md text-center text-sm md:text-base text-ink-soft/70">{caption || "Featured Story Photograph"}</span>
        )}
      </div>
      {credit && <figcaption className="mt-2 text-right font-mono text-[0.68rem] text-ink-soft">{credit}</figcaption>}
    </figure>
  );
}
