import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHeader from "@/components/site/PageHeader";
import Pill from "@/components/site/Pill";
import ArticleBody from "@/components/site/ArticleBody";
import { SITE } from "@/config/site";
import { getAllArticleSlugs, getArticleBySlug } from "@/lib/news";
import { resolveMediaUrl } from "@/lib/url-utils";
import { formatDate, formatCategoryName, formatReadTime } from "@/lib/formatters";

export async function generateStaticParams() {
  const slugs = await getAllArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {
      title: `Dispatch Not Found | ${SITE.name}`,
    };
  }

  const articleUrl = `${SITE.url}/article/${article.slug}`;

  return {
    title: `${article.title} | ${SITE.name}`,
    description: article.deck,
    alternates: {
      canonical: articleUrl,
    },
    openGraph: {
      title: article.title,
      description: article.deck,
      url: articleUrl,
      siteName: SITE.name,
      locale: "en_NG",
      type: "article",
      publishedTime: article.publishedAt,
      authors: [article.author.name],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.deck,
      creator: "@cherrylmedia",
    },
  };
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.deck,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    author: [
      {
        "@type": "Person",
        name: article.author.name,
        jobTitle: article.author.role,
      },
    ],
    publisher: {
      "@type": "NewsMediaOrganization",
      name: SITE.name,
      url: SITE.url,
      logo: {
        "@type": "ImageObject",
        url: `${SITE.url}/favicon.ico`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE.url}/article/${article.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="pb-24">
        <PageHeader
          label={article.kicker || formatCategoryName(article.categoryName || article.category)}
          title={article.title}
          intro={article.deck}
          compact
          byline={
            <>
              <div className="flex items-center gap-2">
                <span>
                  By <strong className="font-semibold text-ink">{article.author.name}</strong>
                </span>
                <span>·</span>
                <span className="font-num whitespace-nowrap">{formatDate(article.publishedAt)}</span>
              </div>
              <span className="font-num text-[0.72rem] text-ink-soft shrink-0 whitespace-nowrap">
                {formatReadTime(article.readTime)}
              </span>
            </>
          }
        />

        <div className="mx-auto w-full max-w-[55rem] px-5 pt-8 md:px-10">
          <figure className="mb-12">
            <div className="aspect-[16/9] w-full rounded-2xl bg-paper-deep/80 relative flex items-center justify-center border border-ink/10 text-ink-soft/40 font-display italic text-2xl overflow-hidden">
              {article.featuredImage.url && !article.featuredImage.url.includes("sample.webp") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resolveMediaUrl(article.featuredImage.url)}
                  alt={article.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="max-w-md text-center text-sm md:text-base text-ink-soft/70">
                  {article.featuredImage.caption || "Featured Story Photograph"}
                </span>
              )}
            </div>
            {article.featuredImage.credit && (
              <figcaption className="mt-2 text-right font-mono text-[0.68rem] text-ink-soft">
                {article.featuredImage.credit}
              </figcaption>
            )}
          </figure>

          {/* Medium-style structured content blocks */}
          <ArticleBody blocks={article.body} />

          {/* Sources Section - simple link list at bottom of article */}
          {(() => {
            const rawSources: { title: string; url: string; publisher?: string }[] = [];

            if (article.sources && Array.isArray(article.sources)) {
              for (const s of article.sources) {
                if (s.url) {
                  rawSources.push({
                    title: s.sourceName || s.claimSummary || s.url,
                    url: s.url,
                    publisher: s.sourceName,
                  });
                }
              }
            }

            if (article.sourceLinks && Array.isArray(article.sourceLinks)) {
              for (const s of article.sourceLinks) {
                if (s.url) {
                  rawSources.push({
                    title: s.publisher || s.url,
                    url: s.url,
                    publisher: s.publisher,
                  });
                }
              }
            }

            if (article.body && Array.isArray(article.body)) {
              for (const b of article.body) {
                if (b.type === "external_link" && b.url) {
                  rawSources.push({
                    title: b.title || b.publisher || b.url,
                    url: b.url,
                    publisher: b.publisher,
                  });
                }
              }
            }

            const seenUrls = new Set<string>();
            const allSources = rawSources.filter((s) => {
              if (!s.url || seenUrls.has(s.url)) return false;
              seenUrls.add(s.url);
              return true;
            });

            if (allSources.length === 0) return null;

            return (
              <div className="mt-12 border-t border-ink/10 pt-6">
                <h3 className="label text-[0.72rem] font-semibold tracking-wider text-ink/60 uppercase">
                  Sources
                </h3>
                <ul className="mt-3.5 space-y-2.5 text-xs text-ink/80">
                  {allSources.map((src, i) => (
                    <li key={i}>
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-ink/85 underline underline-offset-4 transition-colors hover:text-brand-red break-words"
                      >
                        {src.title}
                      </a>
                      {src.publisher && src.publisher !== src.title && (
                        <span className="text-ink-soft"> &mdash; {src.publisher}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })()}

          {/* Social Syndication */}
          {article.channelVariants && (
            <div className="mt-8 rounded-2xl border border-ink/10 bg-cream p-6">
              <div className="flex items-center justify-between border-b border-ink/10 pb-3">
                <span className="label font-medium text-ink-soft">SOCIAL MEDIA CHANNELS</span>
                <span className="font-num text-[0.68rem] font-medium text-brand-red">Published Across Platforms</span>
              </div>
              <div className="mt-4 grid gap-4 text-xs sm:grid-cols-2">
                {article.channelVariants.x && (
                  <div className="rounded-xl border border-ink/10 bg-paper/50 p-3.5">
                    <span className="font-medium text-ink block mb-1">X (Twitter)</span>
                    <p className="text-ink-soft leading-relaxed line-clamp-3">
                      {article.channelVariants.x}
                    </p>
                  </div>
                )}
                {article.channelVariants.linkedin && (
                  <div className="rounded-xl border border-ink/10 bg-paper/50 p-3.5">
                    <span className="font-medium text-ink block mb-1">LinkedIn</span>
                    <p className="text-ink-soft leading-relaxed line-clamp-3">
                      {article.channelVariants.linkedin}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-12 flex items-center justify-between border-t border-ink/10 pt-6">
            <Pill href="/" variant="ghost" arrow="left">
              Back to All Stories
            </Pill>
            <span className="font-num text-xs font-medium text-ink-soft">
              Cherryl Media · Verified Story
            </span>
          </div>
        </div>
      </article>
    </>
  );
}
