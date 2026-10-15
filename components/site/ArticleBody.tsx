import Link from "next/link";
import type { ContentBlock } from "@/lib/types";
import { getYouTubeEmbedUrl, resolveMediaUrl } from "@/lib/url-utils";

export default function ArticleBody({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="space-y-7 text-[1.08rem] font-normal leading-relaxed text-ink">
      {blocks.map((block, idx) => {
        switch (block.type) {
          case "paragraph":
            if (block.isDropCap) {
              return (
                <p
                  key={idx}
                  className="first-letter:font-display first-letter:text-5xl first-letter:font-normal first-letter:mr-2.5 first-letter:float-left first-letter:text-brand-red first-letter:leading-none"
                >
                  {block.text}
                </p>
              );
            }
            return <p key={idx}>{block.text}</p>;

          case "heading":
            if (block.level === 2) {
              return (
                <h2
                  key={idx}
                  className="mt-10 mb-3 font-area text-[1.4rem] md:text-[1.6rem] font-semibold leading-snug tracking-[-0.02em] text-ink"
                >
                  {block.text}
                </h2>
              );
            }
            return (
              <h3
                key={idx}
                className="mt-7 mb-2.5 font-area text-[1.18rem] md:text-[1.3rem] font-semibold tracking-[-0.02em] text-ink"
              >
                {block.text}
              </h3>
            );

          case "quote":
            return (
              <figure key={idx} className="my-8 border-l-2 border-brand-red pl-6 md:pl-7">
                <blockquote className="font-display text-[1.22rem] md:text-[1.38rem] font-normal italic leading-snug text-ink">
                  &ldquo;{block.quote}&rdquo;
                </blockquote>
                {(block.author || block.context) && (
                  <figcaption className="mt-2.5 text-xs font-sans font-medium uppercase tracking-wider text-ink-soft">
                    — {block.author} {block.context ? `(${block.context})` : ""}
                  </figcaption>
                )}
              </figure>
            );

          case "image":
            return (
              <figure key={idx} className="my-8">
                <div className="aspect-[16/10] w-full overflow-hidden rounded-2xl border border-ink/10 bg-paper-deep/70 relative flex items-center justify-center text-ink/50 font-display italic text-lg">
                  {block.src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={resolveMediaUrl(block.src)}
                      alt={block.alt || "Story photo"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    block.alt || "Story Photograph"
                  )}
                </div>
                {(block.caption || block.credit) && (
                  <figcaption className="mt-2.5 flex items-center justify-between text-xs text-ink-soft">
                    <span className="font-medium text-ink/80">{block.caption}</span>
                    {block.credit && <span className="font-mono text-[0.68rem]">{block.credit}</span>}
                  </figcaption>
                )}
              </figure>
            );

          case "video":
            return (
              <figure key={idx} className="my-8">
                <div className="w-full overflow-hidden rounded-2xl border border-ink/10 bg-black aspect-video relative flex items-center justify-center">
                  <video
                    src={resolveMediaUrl(block.src)}
                    poster={block.poster ? resolveMediaUrl(block.poster) : undefined}
                    controls
                    preload="metadata"
                    playsInline
                    className="h-full w-full object-cover"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
                {(block.caption || block.credit) && (
                  <figcaption className="mt-2.5 flex items-center justify-between text-xs text-ink-soft">
                    <span className="font-medium text-ink/80">{block.caption}</span>
                    {block.credit && <span className="font-mono text-[0.68rem]">{block.credit}</span>}
                  </figcaption>
                )}
              </figure>
            );

          case "youtube": {
            const embedUrl = getYouTubeEmbedUrl(block.url);
            return (
              <figure key={idx} className="my-8">
                <div className="aspect-video w-full overflow-hidden rounded-2xl border border-ink/10 bg-black shadow-sm">
                  {embedUrl ? (
                    <iframe
                      src={embedUrl}
                      title={block.caption || "YouTube video player"}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="h-full w-full border-0"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-mono text-ink-soft">
                      Invalid YouTube URL
                    </div>
                  )}
                </div>
                {block.caption && (
                  <figcaption className="mt-2.5 text-xs text-ink-soft font-medium text-ink/80">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );
          }

          case "internal_link":
            return (
              <aside key={idx} className="my-7">
                <Link
                  href={`/article/${block.slug}`}
                  className="group flex flex-col justify-between rounded-2xl border border-ink/15 bg-paper-deep/40 p-5 transition-all duration-300 hover:bg-white/20 hover:border-ink/25 sm:flex-row sm:items-center"
                >
                  <div className="max-w-xl">
                    <span className="label text-[0.65rem] font-medium text-brand-red">
                      RELATED STORY · {block.category}
                    </span>
                    <h4 className="mt-1 font-area text-base md:text-lg font-semibold leading-snug tracking-[-0.02em] text-ink transition-colors group-hover:text-ink/80">
                      {block.title}
                    </h4>
                    {block.deck && (
                      <p className="mt-1 line-clamp-1 text-xs font-normal text-ink-soft">
                        {block.deck}
                      </p>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-ink-soft transition-colors group-hover:text-ink sm:mt-0">
                    <span>Read story</span>
                  </div>
                </Link>
              </aside>
            );

          case "external_link":
            // Consolidated into the dedicated Sources list at the bottom of the article
            return null;

          default:
            return null;
        }
      })}
    </div>
  );
}
