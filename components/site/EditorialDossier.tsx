import Link from "next/link";
import Arrow from "./Arrow";
import Pill from "./Pill";
import { getEditorialCopy } from "@/lib/settings";
import { getCuratedSections } from "@/lib/sections";
import { formatDate, formatReadTime } from "@/lib/formatters";

export default async function EditorialDossier() {
  const [curated, copy] = await Promise.all([
    getCuratedSections(),
    getEditorialCopy(),
  ]);

  const leadStory = curated.byKey?.dossier_lead?.articles?.[0];
  const soundscapesStory = curated.byKey?.dossier_soundscapes?.articles?.[0];
  const gastronomyStory = curated.byKey?.dossier_gastronomy?.articles?.[0];
  const radarStories = curated.byKey?.dossier_radar?.articles || [];

  return (
    <section className="mx-auto mt-20 w-full max-w-[90rem] px-5 md:mt-32 md:px-10 xl:px-16" aria-labelledby="dossier-heading">
      <div className="flex flex-col items-start gap-4 border-b border-ink/15 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="label-red font-medium">{copy.dossier.issueBadge}</span>
          <h2 id="dossier-heading" className="mt-2 font-area text-[clamp(1.45rem,2.5vw,2rem)] font-semibold leading-tight tracking-[-0.02em] text-ink">
            {copy.dossier.heading}
          </h2>
          <p className="mt-1 text-xs text-ink/70 max-w-xl font-normal">
            {copy.dossier.subheading}
          </p>
        </div>
        <Pill href="/category/entertainment-internet-culture" variant="ghost" className="self-start sm:self-auto w-fit">
          All Culture Stories
        </Pill>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:gap-8">
        {/* The Feature Lead Column */}
        {leadStory && (
          <article className="group flex flex-col justify-between rounded-[1.75rem] border border-ink/10 bg-cream p-4 sm:p-5 transition-all duration-300 hover:border-brand-red/40 lg:col-span-5 lg:p-8">
            <div>
              <div className="flex items-center justify-between text-xs text-ink-soft">
                <span className="label text-brand-red font-semibold">FEATURE STORY</span>
                <span className="font-num font-medium">{formatReadTime(leadStory.readTime)}</span>
              </div>

              <div className="mt-5 aspect-[16/10] w-full rounded-2xl border border-ink/10 bg-paper-deep/60 p-6 flex flex-col justify-between relative overflow-hidden">
                {leadStory.featuredImage?.url ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={leadStory.featuredImage.url}
                      alt={leadStory.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent" />
                    <span className="label text-[0.65rem] font-medium text-white/90 z-10">PHOTO ESSAY ARCHIVE</span>
                    <p className="font-display text-base md:text-lg font-normal italic text-white z-10 drop-shadow">
                      &ldquo;{leadStory.kicker || "Featured Cultural Investigation"}&rdquo;
                    </p>
                    <span className="text-[0.7rem] font-medium text-white/80 z-10">
                      {leadStory.featuredImage.caption || "Cherryl Media Visual Archive"}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="label text-[0.65rem] font-medium text-ink-soft z-10">PHOTO ESSAY ARCHIVE</span>
                    <p className="font-display text-base md:text-lg font-normal italic text-ink/80 z-10">
                      &ldquo;We stopped negotiating for shelf space. We engineered the audience first.&rdquo;
                    </p>
                    <span className="text-[0.7rem] font-medium text-ink-soft z-10">Lagos Soundstages &amp; Studio Lots</span>
                  </>
                )}
              </div>

              <h3 className="mt-5 font-area text-[1.22rem] md:text-[1.35rem] font-semibold leading-snug tracking-[-0.02em] text-ink transition-all duration-200 group-hover:italic group-hover:text-brand-red">
                <Link href={`/article/${leadStory.slug}`}>
                  {leadStory.title}
                </Link>
              </h3>

              <p className="mt-3 text-sm font-normal leading-relaxed text-ink/80 line-clamp-2 md:line-clamp-3">
                {leadStory.deck || leadStory.excerpt}
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-ink/10 pt-4 text-xs font-medium text-ink-soft">
              <span>By {typeof leadStory.author === "string" ? leadStory.author : leadStory.author?.name} · {leadStory.author?.role || "Culture Bureau"}</span>
              <Arrow className="h-3 w-3 text-brand-red transition-transform duration-200 group-hover:translate-x-1" />
            </div>
          </article>
        )}

        {/* Center Features Column: Soundscapes & Gastronomy */}
        <div className="flex flex-col justify-between gap-6 lg:col-span-4">
          {soundscapesStory && (
            <article className="group flex flex-1 flex-col justify-between rounded-[1.75rem] border border-ink/10 bg-cream p-4 sm:p-5 md:p-6 transition-all duration-300 hover:border-brand-red/40">
              <div>
                <div className="flex items-center justify-between text-xs text-ink-soft">
                  <span className="label text-brand-red font-semibold">
                    {soundscapesStory.kicker || "SOUNDSCAPES"}
                  </span>
                  <span className="font-num font-medium">{formatReadTime(soundscapesStory.readTime)}</span>
                </div>
                <h3 className="mt-3 font-area text-base md:text-[1.08rem] font-semibold leading-snug tracking-[-0.02em] text-ink transition-all duration-200 group-hover:italic group-hover:text-brand-red">
                  <Link href={`/article/${soundscapesStory.slug}`}>
                    {soundscapesStory.title}
                  </Link>
                </h3>
                <p className="mt-2 text-xs font-normal leading-relaxed text-ink/70 line-clamp-2">
                  {soundscapesStory.deck || soundscapesStory.excerpt}
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-ink/10 pt-3 text-[0.75rem] text-ink-soft">
                <span>By {typeof soundscapesStory.author === "string" ? soundscapesStory.author : soundscapesStory.author?.name}</span>
                <span className="font-num text-[0.7rem] shrink-0 whitespace-nowrap">{formatDate(soundscapesStory.publishedAt)}</span>
              </div>
            </article>
          )}

          {gastronomyStory && (
            <article className="group flex flex-1 flex-col justify-between rounded-[1.75rem] border border-ink/10 bg-cream p-4 sm:p-5 md:p-6 transition-all duration-300 hover:border-brand-red/40">
              <div>
                <div className="flex items-center justify-between text-xs text-ink-soft">
                  <span className="label text-brand-red">
                    {gastronomyStory.kicker || "FOOD & HERITAGE"}
                  </span>
                  <span className="font-num font-medium">{formatReadTime(gastronomyStory.readTime)}</span>
                </div>
                <h3 className="mt-4 font-area text-base md:text-[1.12rem] font-semibold leading-snug tracking-[-0.02em] text-ink transition-all duration-200 group-hover:italic group-hover:text-brand-red">
                  <Link href={`/article/${gastronomyStory.slug}`}>
                    {gastronomyStory.title}
                  </Link>
                </h3>
                <p className="mt-2 text-xs font-normal leading-relaxed text-ink/70 line-clamp-2">
                  {gastronomyStory.deck || gastronomyStory.excerpt}
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-ink/10 pt-3 text-[0.75rem] text-ink-soft">
                <span>By {typeof gastronomyStory.author === "string" ? gastronomyStory.author : gastronomyStory.author?.name}</span>
                <span className="font-num text-[0.7rem] shrink-0 whitespace-nowrap">{formatDate(gastronomyStory.publishedAt)}</span>
              </div>
            </article>
          )}
        </div>

        {/* Right Culture Briefs Column */}
        <div className="flex flex-col rounded-[1.75rem] border border-ink/10 bg-paper-deep/30 p-4 sm:p-5 md:p-6 lg:col-span-3">
          <div className="flex items-center justify-between border-b border-ink/10 pb-3">
            <span className="label text-brand-red">CULTURE BRIEFS</span>
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-red" />
          </div>

          <ul className="mt-4 divide-y divide-ink/10">
            {radarStories.map((item, idx) => (
              <li key={item.slug || item.id} className="group py-4 first:pt-2 last:pb-0">
                <Link href={`/article/${item.slug}`} className="block">
                  <div className="flex items-center justify-between">
                    <span className="label text-[0.62rem] text-brand-red truncate max-w-[150px]">
                      {item.kicker || "RADAR"}
                    </span>
                    <span className="font-num text-[0.68rem] text-ink-soft">
                      {item.readTime ? formatReadTime(item.readTime) : `0${idx + 1}`}
                    </span>
                  </div>
                  <h4 className="mt-1.5 font-area text-[0.95rem] font-medium leading-snug tracking-[-0.02em] text-ink transition-all duration-200 group-hover:italic group-hover:text-brand-red">
                    {item.title}
                  </h4>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
