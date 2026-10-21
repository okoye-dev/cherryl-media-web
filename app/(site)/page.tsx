import Ticker from "@/components/site/Ticker";
import Hero from "@/components/site/Hero";
import IndexList from "@/components/site/IndexList";
import FieldNotes from "@/components/site/FieldNotes";
import FigureCard from "@/components/site/FigureCard";
import MediaDistributionStrip from "@/components/site/MediaDistributionStrip";
import EditorialDossier from "@/components/site/EditorialDossier";
import SectionHeader from "@/components/site/SectionHeader";
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
      <div className="mx-auto mt-20 grid w-full max-w-[90rem] gap-14 px-5 md:mt-28 md:grid-cols-[1.35fr_1fr] md:gap-14 md:px-10 xl:px-16">
        <section aria-labelledby="state-affairs-dispatches" className="min-w-0">
          <SectionHeader
            id="state-affairs-dispatches"
            title="State Affairs & Environs"
            href="/category/state-affairs-environs"
            linkLabel="Explore all"
          />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8">
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
      <section
        aria-labelledby="brands-smes"
        className="mx-auto mt-20 w-full max-w-[90rem] px-5 md:mt-28 md:px-10 xl:px-16"
      >
        <SectionHeader
          id="brands-smes"
          title="Brands & SMEs"
          href="/category/brands-smes"
          linkLabel="View all"
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3">
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
