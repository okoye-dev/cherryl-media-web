import Link from "next/link";
import Pill from "./Pill";
import Arrow from "./Arrow";
import { getLeadStory, getDispatches } from "@/lib/news";
import { getEditorialCopy } from "@/lib/settings";
import { getCuratedSections } from "@/lib/sections";
import { formatDate, formatCategoryName, formatReadTime } from "@/lib/formatters";

export default async function Hero() {
  const [curated, defaultLead, defaultDispatches, copy] = await Promise.all([
    getCuratedSections(),
    getLeadStory(),
    getDispatches(),
    getEditorialCopy(),
  ]);

  const leadStory = curated.byKey?.hero_lead?.articles?.[0] || defaultLead;
  const trendingStories =
    curated.byKey?.hero_trending?.articles &&
    curated.byKey.hero_trending.articles.length > 0
      ? curated.byKey.hero_trending.articles
      : defaultDispatches.slice(0, 3);

  return (
    <section className="mx-auto w-full max-w-[90rem] px-5 pt-8 md:px-10 md:pt-12 xl:px-16">
      <div className="flex flex-col justify-between gap-4 border-b border-ink/10 pb-6 md:flex-row md:items-end">
        <div className="max-w-3xl">
          <p className="label-red intro font-semibold">
            {copy.hero.editionBadge}
          </p>
          <h1
            className="intro mt-3 text-[clamp(2.35rem,4.4vw,3.8rem)] font-bold leading-[1.03] tracking-[-0.025em] text-ink"
            style={{ animationDelay: "100ms" }}
          >
            <span className="font-sans font-bold">{copy.hero.titleLead}</span>
            <span className="font-display font-medium italic text-brand-red">
              {copy.hero.titleAccent}
            </span>
            <span className="font-sans font-bold">{copy.hero.titleTrail}</span>
          </h1>
          <p className="intro mt-3 text-[0.98rem] font-normal leading-relaxed text-ink/75 max-w-2xl">
            {copy.hero.description}
          </p>
        </div>

        <div
          className="intro flex flex-wrap items-center gap-2"
          style={{ animationDelay: "200ms" }}
        >
          <Pill href="/category/nigerian-current-affairs" variant="red">
            Current Affairs
          </Pill>
          <Pill href="/category/practical-nigerian-updates" variant="ghost">
            Practical Updates
          </Pill>
          <Pill href="/category/stories-romance" variant="ghost">
            Stories &amp; Romance
          </Pill>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.55fr_1fr] lg:gap-10">
        <article
          className="group relative flex flex-col justify-between rounded-card border border-ink/10 bg-cream/70 p-4 transition-all duration-500 hover:border-brand-red/40 hover:bg-cream sm:p-5 md:p-8"
          style={{ animationDelay: "300ms" }}
        >
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="label-red font-medium min-w-0 truncate">
                {leadStory.kicker}
              </span>
              <span className="font-num text-[0.72rem] font-medium text-ink-soft shrink-0 whitespace-nowrap">
                {formatDate(leadStory.publishedAt)}
              </span>
            </div>

            <div className="mt-4 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-paper-deep/80 relative">
              <div className="absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent z-10" />
              <div className="absolute top-4 left-4 z-20">
                <span className="rounded-full bg-brand-red px-3 py-1 font-num text-[0.68rem] font-medium uppercase tracking-wider text-white">
                  Featured Story
                </span>
              </div>
              {leadStory.featuredImage?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={leadStory.featuredImage.url}
                  alt={leadStory.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-ink/40 font-display italic text-xl">
                  Cherryl Media
                </div>
              )}
            </div>

            <Link href={`/article/${leadStory.slug}`} className="mt-4 block">
              <h2 className="font-area text-[clamp(1.35rem,2.2vw,1.85rem)] font-semibold leading-snug tracking-[-0.02em] text-ink transition-all duration-200 group-hover:italic group-hover:text-brand-red">
                {leadStory.title}
              </h2>
            </Link>

            <p className="mt-2.5 text-[0.98rem] font-normal leading-relaxed text-ink/80 line-clamp-2 md:line-clamp-3">
              {leadStory.deck}
            </p>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-ink/10 pt-3.5 text-xs">
            <span className="text-ink-soft font-sans">
              By <strong className="font-medium text-ink">{typeof leadStory.author === "string" ? leadStory.author : leadStory.author.name}</strong> · {formatReadTime(leadStory.readTime)}
            </span>
            <Link
              href={`/article/${leadStory.slug}`}
              className="inline-flex items-center gap-1.5 font-medium text-brand-red transition-transform duration-200 group-hover:translate-x-1"
            >
              Read full story
              <Arrow className="h-3 w-3" />
            </Link>
          </div>
        </article>

        <div className="flex flex-col">
          <div className="flex items-center justify-between border-b border-ink/10 pb-3">
            <h3 className="label font-bold text-brand-red tracking-wider">TRENDING STORIES</h3>
            <span className="text-[0.68rem] font-semibold text-ink-soft uppercase tracking-wider">Top Dispatches</span>
          </div>

          <div className="flex flex-col">
            {trendingStories.slice(0, 3).map((story, i) => (
              <div key={story.slug} className="w-full">
                {i > 0 && <div className="w-full border-t border-ink/10" />}
                <article
                  className={`group relative -mx-4 px-4 rounded-2xl transition-colors duration-200 hover:bg-ink/[0.05] ${
                    i === 0 ? "pt-3.5 pb-4 sm:pt-4 sm:pb-4.5" : "py-4 sm:py-4.5"
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-num text-[0.7rem] font-bold text-brand-red leading-none">
                      0{i + 1}
                    </span>
                    <span className="label text-[0.62rem] font-bold uppercase tracking-wider text-ink-soft leading-none">
                      {formatCategoryName(story.categoryName || story.category)}
                    </span>
                    {story.urgent && (
                      <span className="rounded bg-brand-red/10 px-1.5 py-0.5 text-[0.58rem] font-bold text-brand-red tracking-wider leading-none">
                        URGENT
                      </span>
                    )}
                  </div>

                  <Link href={`/article/${story.slug}`} className="mt-2 block">
                    <h4 className="font-area text-[1.12rem] md:text-[1.24rem] font-semibold leading-snug tracking-[-0.02em] text-ink transition-all duration-200 group-hover:italic group-hover:text-brand-red">
                      {story.title}
                    </h4>
                  </Link>

                  <div className="mt-3 flex items-center justify-between text-[0.72rem] text-ink-soft">
                    <span className="font-medium text-ink-soft/90">
                      {typeof story.author === "string" ? story.author : story.author.name} · {formatReadTime(story.readTime)}
                    </span>
                    <span className="text-brand-red transition-transform duration-200 group-hover:translate-x-1">
                      <Arrow className="h-3 w-3" />
                    </span>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
