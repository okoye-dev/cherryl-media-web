import Ticker from "@/components/site/Ticker";
import Hero from "@/components/site/Hero";
import IndexList from "@/components/site/IndexList";
import FieldNotes from "@/components/site/FieldNotes";
import FigureCard from "@/components/site/FigureCard";
import MediaDistributionStrip from "@/components/site/MediaDistributionStrip";
import EditorialDossier from "@/components/site/EditorialDossier";
import Pill from "@/components/site/Pill";
import { getCuratedSections } from "@/lib/sections";

export const revalidate = 30; // ISR revalidation every 30 seconds

export default async function Home() {
  const curated = await getCuratedSections();

  // Top pillars informed by the 28,000+ posts database inventory:
  // 1. State Affairs & Environs (10,033 posts)
  // 2. Newsbeat (9,946 posts)
  // 3. Brands & SMEs (2,063 posts)
  // 4. Opinions (2,027 posts)
  const stateAffairsStories =
    curated.byKey?.state_affairs?.articles ||
    curated.byKey?.featured_updates?.articles?.slice(0, 4) ||
    [];

  const brandsStories =
    curated.byKey?.brands_smes?.articles ||
    curated.byKey?.hero_trending?.articles?.slice(0, 3) ||
    [];

  return (
    <>
      <Ticker />
      <Hero />
      <IndexList />

      {/* Flagship Section 1: State Affairs & Environs (10,000+ post archive pillar) */}
      <div className="mx-auto mt-16 grid w-full max-w-[90rem] gap-12 px-5 md:mt-24 md:grid-cols-[1.35fr_1fr] md:gap-14 md:px-10 xl:px-16">
        <section aria-labelledby="state-affairs-dispatches">
          <div className="flex items-center justify-between gap-3 pb-4 text-ink-soft">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-brand-red" />
              <h2 id="state-affairs-dispatches" className="label text-ink-soft uppercase font-bold tracking-wider">
                State Affairs &amp; Environs
              </h2>
            </div>
            <Pill href="/category/state-affairs-environs" variant="ghost">
              Explore All ↗
            </Pill>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6">
            {stateAffairsStories.map((story, i) => (
              <FigureCard
                key={story.slug || story.id}
                index={i + 1}
                name={story.title}
                category={story.categoryName || story.category}
                href={`/article/${story.slug}`}
                readTime={story.readTime}
                imageUrl={story.featuredImage?.url}
              />
            ))}
          </div>
        </section>

        {/* Flagship Section 2: Opinions & Perspectives */}
        <FieldNotes />
      </div>

      {/* Flagship Section 3: Brands & SMEs Commercial Coverage */}
      <section className="mx-auto mt-16 w-full max-w-[90rem] px-5 md:mt-24 md:px-10 xl:px-16">
        <div className="flex items-center justify-between border-b border-ink/10 pb-4 text-ink-soft">
          <div className="flex items-center gap-2">
            <span className="label font-bold uppercase tracking-wider text-ink-soft">
              Brands &amp; SMEs · Commercial Intelligence
            </span>
          </div>
          <Pill href="/category/brands-smes" variant="ghost">
            View All Brands Dispatches ↗
          </Pill>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {brandsStories.map((story, i) => (
            <FigureCard
              key={story.slug || story.id}
              index={i + 1}
              name={story.title}
              category={story.categoryName || story.category}
              href={`/article/${story.slug}`}
              readTime={story.readTime}
              imageUrl={story.featuredImage?.url}
            />
          ))}
        </div>
      </section>

      {/* Multi-channel Media Distribution Network Strip */}
      <MediaDistributionStrip />

      {/* Cultural Dossier & Longform In-Depth */}
      <EditorialDossier />
    </>
  );
}
