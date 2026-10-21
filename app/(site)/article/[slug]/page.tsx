import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHeader from "@/components/site/PageHeader";
import Pill from "@/components/site/Pill";
import ArticleBody from "@/components/site/ArticleBody";
import ArticleCover from "@/components/site/article/ArticleCover";
import ArticleSources from "@/components/site/article/ArticleSources";
import ArticleTags from "@/components/site/article/ArticleTags";
import ArticleRelated from "@/components/site/article/ArticleRelated";
import ArticleSocial from "@/components/site/article/ArticleSocial";
import { getAllArticleSlugs, getArticleBySlug } from "@/services/public-articles";
import { articleJsonLd, articleMetadata } from "@/lib/article-seo";
import { formatDate, formatCategoryName, formatReadTime, authorName, TEAM_BYLINE } from "@/lib/formatters";

export const dynamicParams = true;
export const revalidate = 30;

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  try {
    const slugs = await getAllArticleSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  return articleMetadata(await getArticleBySlug(slug));
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(article)) }} />
      <article className="pb-24">
        <PageHeader
          label={article.kicker || formatCategoryName(article.categoryName || article.category)}
          title={article.title}
          intro={article.subtitle || article.deck}
          compact
          byline={
            <>
              <div className="flex items-center gap-2">
                <span>
                  By <strong className="font-semibold text-ink">{authorName(article) || TEAM_BYLINE}</strong>
                </span>
                <span>·</span>
                <span className="font-num whitespace-nowrap">{formatDate(article.publishedAt)}</span>
              </div>
              <span className="font-num text-[0.72rem] text-ink-soft shrink-0 whitespace-nowrap">{formatReadTime(article.readTime)}</span>
            </>
          }
        />

        <div className="mx-auto w-full max-w-[55rem] px-5 pt-8 md:px-10">
          <ArticleCover article={article} />
          <ArticleBody blocks={article.body} />
          <ArticleSources article={article} />
          <ArticleTags tags={article.tags} />
          <ArticleRelated stories={article.related_stories} />
          <ArticleSocial variants={article.channelVariants} />

          <div className="mt-12 flex items-center justify-between border-t border-ink/10 pt-6">
            <Pill href="/" arrow="back">
              Back to All Stories
            </Pill>
            <span className="font-num text-xs font-medium text-ink-soft">Cherryl Media · Verified Story</span>
          </div>
        </div>
      </article>
    </>
  );
}
