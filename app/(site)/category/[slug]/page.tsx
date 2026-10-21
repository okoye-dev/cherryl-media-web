import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHeader from "@/components/site/PageHeader";
import FigureCard from "@/components/site/FigureCard";
import Pill from "@/components/site/Pill";
import { SITE } from "@/config/site";

import { getArticlesByCategory } from "@/lib/articles";

export function generateStaticParams() {
  return SITE.categories.map((c) => ({ slug: c.slug }));
}

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const cat = SITE.categories.find((c) => c.slug === slug);
  if (!cat) return { title: `Desk | ${SITE.name}` };

  const url = `${SITE.url}/category/${cat.slug}`;

  return {
    title: `${cat.name} Editorial Desk | ${SITE.name}`,
    description: cat.summary,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${cat.name} | ${SITE.name}`,
      description: cat.summary,
      url,
      siteName: SITE.name,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${cat.name} | ${SITE.name}`,
      description: cat.summary,
      creator: "@cherrylmedia",
    },
  };
}

export default async function CategoryPage({ params }: { params: Params }) {
  const { slug } = await params;
  const category = SITE.categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const articles = await getArticlesByCategory(category.slug);

  return (
    <>
      <PageHeader
        label="Editorial Desk · Verified Dispatches"
        title={category.name}
        intro={category.summary}
      />

      <div className="mx-auto w-full max-w-[90rem] px-5 pt-12 md:px-10 xl:px-16">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((story, i) => (
            <FigureCard
              key={story.id || story.slug}
              index={i + 1}
              name={story.title}
              category={story.kicker || category.name}
              href={`/article/${story.slug}`}
              readTime={story.readTime || "4 min"}
              imageUrl={story.featuredImage?.url}
            />
          ))}
        </div>

        <div className="mt-14 border-t border-ink/10 pt-8 flex items-center justify-between">
          <Pill href="/" arrow="back">
            Back to All Stories
          </Pill>
          <span className="font-num text-xs text-ink-soft">
            Showing latest verified articles
          </span>
        </div>
      </div>
    </>
  );
}
