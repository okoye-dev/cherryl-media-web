import Link from "next/link";
import Pill from "./Pill";
import Arrow from "./Arrow";
import { getLeadStory, getDispatches } from "@/lib/news";

export default async function Hero() {
  const [leadStory, dispatches] = await Promise.all([
    getLeadStory(),
    getDispatches(),
  ]);

  return (
    <section className="mx-auto w-full max-w-[90rem] px-5 pt-8 md:px-10 md:pt-12 xl:px-16">
      <div className="flex flex-col justify-between gap-4 border-b border-ink/10 pb-6 md:flex-row md:items-end">
        <div>
          <p className="label-red intro font-medium">
            CHERRYL MEDIA · DAILY EDITION
          </p>
          <h1
            className="intro mt-3 max-w-[26ch] text-[clamp(2.1rem,4.2vw,3.6rem)] font-normal leading-[1.02] tracking-[-0.02em] text-ink"
            style={{ animationDelay: "100ms" }}
          >
            <span className="font-sans font-normal">Independent </span>
            <span className="font-display font-normal italic text-brand-red">
              journalism
            </span>
            <span className="font-sans font-normal"> &amp; digital media network.</span>
          </h1>
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
          className="group relative flex flex-col justify-between rounded-card border border-ink/10 bg-cream/70 p-6 transition-all duration-500 hover:border-brand-red/40 hover:bg-cream md:p-8"
          style={{ animationDelay: "300ms" }}
        >
          <div>
            <div className="flex items-center justify-between gap-4">
              <span className="label-red font-medium">
                {leadStory.kicker}
              </span>
              <span className="font-num text-xs font-medium text-ink-soft">
                {leadStory.publishedAt}
              </span>
            </div>

            <div className="mt-5 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-paper-deep/80 relative">
              <div className="absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent z-10" />
              <div className="absolute top-4 left-4 z-20">
                <span className="rounded-full bg-brand-red px-3 py-1 font-num text-[0.68rem] font-medium uppercase tracking-wider text-white">
                  Featured Story
                </span>
              </div>
              <div className="h-full w-full flex items-center justify-center text-ink/40 font-display italic text-xl">
                Cherryl Media
              </div>
            </div>

            <Link href={`/article/${leadStory.slug}`} className="mt-5 block">
              <h2 className="font-display text-[clamp(1.3rem,2.1vw,1.75rem)] font-normal leading-snug tracking-[-0.012em] text-ink transition-colors duration-300 group-hover:text-brand-red">
                {leadStory.title}
              </h2>
            </Link>

            <p className="mt-3 text-[0.98rem] font-normal leading-relaxed text-ink/80">
              {leadStory.deck}
            </p>
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-ink/10 pt-4 text-xs">
            <span className="text-ink-soft font-sans">
              By <strong className="font-medium text-ink">{typeof leadStory.author === "string" ? leadStory.author : leadStory.author.name}</strong> · {leadStory.readTime}
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

        <div className="flex flex-col divide-y divide-ink/10">
          <div className="pb-3">
            <h3 className="label font-medium text-ink-soft">Trending Stories</h3>
          </div>

          {dispatches.map((story, i) => (
            <article
              key={story.slug}
              className="group relative flex flex-col justify-between py-4 transition-colors duration-300"
            >
              <div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="font-num text-sm font-medium text-brand-red">
                    0{i + 1}
                  </span>
                  <span className="label text-[0.68rem] font-medium text-ink-soft">
                    {story.categoryName || story.category}
                  </span>
                  {story.urgent && (
                    <span className="rounded bg-brand-red/10 px-1.5 py-0.5 text-[0.62rem] font-medium text-brand-red">
                      URGENT
                    </span>
                  )}
                </div>

                <Link href={`/article/${story.slug}`} className="mt-1.5 block">
                  <h4 className="font-display text-[1.12rem] md:text-[1.2rem] font-normal leading-snug tracking-[-0.01em] text-ink transition-colors duration-300 group-hover:italic group-hover:text-brand-red">
                    {story.title}
                  </h4>
                </Link>

                <p className="mt-1.5 line-clamp-2 text-xs font-normal leading-relaxed text-ink/75">
                  {story.deck}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between text-[0.72rem] text-ink-soft">
                <span>{typeof story.author === "string" ? story.author : story.author.name} · {story.readTime}</span>
                <span className="transition-transform duration-200 group-hover:translate-x-1 group-hover:text-brand-red">
                  <Arrow className="h-3 w-3" />
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
