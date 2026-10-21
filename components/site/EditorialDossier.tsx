import Link from "next/link";
import SectionHeader from "./SectionHeader";
import SectionArt from "./SectionArt";
import { getEditorialCopy } from "@/lib/settings";
import { getCuratedSections, sectionArticles } from "@/lib/sections";
import {
  formatDate,
  formatReadTime,
  formatCategoryName,
  authorName,
  TEAM_BYLINE,
} from "@/lib/formatters";

type Story = NonNullable<
  Awaited<ReturnType<typeof getCuratedSections>>["byKey"][string]
>["articles"][number];

/** A small label above a title. Quiet on purpose, so the title leads. */
function Kicker({ story }: { story: Story }) {
  return (
    <span className="label text-[0.62rem] font-semibold leading-none text-brand-red/85">
      {story.kicker || formatCategoryName(story.categoryName || story.category)}
    </span>
  );
}

/** Name (only when there is one) on the left, date on the right. */
function Meta({ story }: { story: Story }) {
  const name = authorName(story);
  return (
    <div className="mt-8 flex items-center justify-between gap-3 border-t border-ink/10 pt-4 text-[0.75rem] text-ink-soft">
      <span className="min-w-0 truncate">{name}</span>
      <span className="font-num shrink-0 whitespace-nowrap text-[0.7rem]">{formatDate(story.publishedAt)}</span>
    </div>
  );
}

export default async function EditorialDossier() {
  const [curated, copy] = await Promise.all([
    getCuratedSections(),
    getEditorialCopy(),
  ]);

  const leadStory = sectionArticles(curated, "dossier_lead")[0];
  const radarStories = sectionArticles(curated, "dossier_radar");

  const sideCards = sectionArticles(curated, "dossier_side") as Story[];

  return (
    <section
      className="relative isolate mx-auto mt-24 w-full max-w-[90rem] px-5 md:mt-36 md:px-10 xl:px-16"
      aria-labelledby="dossier-heading"
    >
      <SectionArt name="waveform" />
      <SectionHeader
        id="dossier-heading"
        eyebrow={copy.dossier.issueBadge}
        title={copy.dossier.heading}
        href="/category/entertainment-lifestyle"
        linkLabel="All culture stories"
      />
      <p className="-mt-3 mb-10 max-w-xl text-sm font-normal text-ink/70 md:mb-12">
        {copy.dossier.subheading}
      </p>

      <div className="grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-4 xl:gap-5">
        {/* The feature lead: the only card here that carries a byline */}
        {leadStory && (
          <article className="group relative flex flex-col rounded-[1.75rem] border border-ink/10 bg-cream p-3 transition-all duration-300 hover:border-brand-red/40 sm:p-4 lg:col-span-5 lg:p-5">
            <div>
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[1.1rem] border border-ink/10 bg-paper-deep">
                {leadStory.featuredImage?.url && (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={leadStory.featuredImage.url}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-night/70 via-transparent to-transparent" />
                  </>
                )}
              </div>

              <div className="mt-6 px-2 sm:px-1">
                <div className="flex items-center justify-between gap-3 text-xs text-ink-soft">
                  <Kicker story={leadStory} />
                  <span className="font-num font-medium">{formatReadTime(leadStory.readTime)}</span>
                </div>
                <h3 className="mt-4 font-area text-[1.35rem] font-semibold leading-snug tracking-[-0.02em] text-ink transition-all duration-200 group-hover:italic group-hover:text-brand-red md:text-[1.5rem]">
                  <Link href={`/article/${leadStory.slug}`} className="after:absolute after:inset-0 after:content-['']">{leadStory.title}</Link>
                </h3>
                <p className="mt-4 line-clamp-4 text-sm font-normal leading-relaxed text-ink/75 md:line-clamp-none">
                  {leadStory.deck || leadStory.excerpt}
                </p>
              </div>
            </div>

            <div className="mx-2 mt-6 flex items-center justify-between border-t border-ink/10 pt-4 text-xs font-medium text-ink-soft sm:mx-1">
              <span>By {authorName(leadStory) || TEAM_BYLINE}</span>
              <span className="font-num text-[0.7rem]">{formatDate(leadStory.publishedAt)}</span>
            </div>
          </article>
        )}

        {/* Two supporting stories */}
        <div className="flex flex-col gap-5 lg:col-span-4 lg:gap-4">
          {sideCards.map((story) => (
            <article
              key={story.slug}
              className="group relative flex flex-col rounded-[1.75rem] border border-ink/10 bg-cream p-6 transition-all duration-300 hover:border-brand-red/40 md:p-7"
            >
              <div>
                <div className="flex items-center justify-between gap-3 text-xs text-ink-soft">
                  <Kicker story={story} />
                  <span className="font-num font-medium">{formatReadTime(story.readTime)}</span>
                </div>
                <h3 className="mt-5 font-area text-[1.2rem] font-semibold leading-snug tracking-[-0.02em] text-ink transition-all duration-200 group-hover:italic group-hover:text-brand-red">
                  <Link href={`/article/${story.slug}`} className="after:absolute after:inset-0 after:content-['']">{story.title}</Link>
                </h3>
                <p className="mt-4 line-clamp-4 text-[0.82rem] font-normal leading-relaxed text-ink/70 lg:line-clamp-none">
                  {story.deck || story.excerpt}
                </p>
              </div>
              <Meta story={story} />
            </article>
          ))}
        </div>

        {/* Culture briefs: a plain rail, no box */}
        <div className="lg:col-span-3 lg:border-l lg:border-ink/15 lg:pl-5">
          <h3 className="border-b border-ink/15 pb-4 font-area text-[1.15rem] font-semibold tracking-[-0.02em] text-ink">
            Culture briefs
          </h3>

          <ul className="divide-y divide-ink/10">
            {radarStories.map((item) => {
              const name = authorName(item);
              return (
                <li key={item.slug || item.id} className="group py-6 first:pt-6">
                  <Link href={`/article/${item.slug}`} className="block">
                    <div className="flex items-center justify-between gap-2">
                      <Kicker story={item} />
                      <span className="font-num shrink-0 text-[0.68rem] text-ink-soft">
                        {formatReadTime(item.readTime)}
                      </span>
                    </div>
                    <h4 className="mt-3 font-area text-[1.1rem] font-semibold leading-snug tracking-[-0.02em] text-ink transition-all duration-200 group-hover:italic group-hover:text-brand-red">
                      {item.title}
                    </h4>
                    {(item.deck || item.excerpt) && (
                      <p className="mt-3 line-clamp-3 text-xs font-normal leading-relaxed text-ink/70">
                        {item.deck || item.excerpt}
                      </p>
                    )}
                    <div className="mt-4 flex items-center gap-2 text-[0.7rem] text-ink-soft">
                      <span className="font-num shrink-0 text-[0.68rem]">{formatDate(item.publishedAt)}</span>
                      {name && <span className="min-w-0 truncate">· {name}</span>}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
