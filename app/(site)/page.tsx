import Ticker from "@/components/site/Ticker";
import Hero from "@/components/site/Hero";
import IndexList from "@/components/site/IndexList";
import FieldNotes from "@/components/site/FieldNotes";
import FigureCard from "@/components/site/FigureCard";
import OverlayCard from "@/components/site/OverlayCard";
import MediaDistributionStrip from "@/components/site/MediaDistributionStrip";
import EditorialDossier from "@/components/site/EditorialDossier";
import SectionHeader from "@/components/site/SectionHeader";
import SectionArt from "@/components/site/SectionArt";
import { getCuratedSections, sectionArticles } from "@/lib/sections";
import { authorName } from "@/lib/formatters";

export const revalidate = 30; // ISR revalidation every 30 seconds

export default async function Home() {
  const curated = await getCuratedSections();

  // Exactly what is curated for each spot, never more than the spot has room for.
  // These limits come from the same list the admin uses (services/sections.ts).
  const stateAffairsStories = sectionArticles(curated, "state_affairs");
  const brandsStories = sectionArticles(curated, "brands_smes");

  return (
    <>
      <Ticker />
      <Hero />
      <IndexList />

      {/* Flagship Section 1: State Affairs & Environs (10,000+ post archive pillar) */}
      <div className="relative isolate mx-auto mt-20 grid w-full max-w-[90rem] gap-14 px-5 md:mt-28 md:grid-cols-[1.35fr_1fr] md:grid-rows-[auto_1fr] md:gap-x-14 md:gap-y-0 md:px-10 xl:px-16">
        <SectionArt name="contours" />
        <SectionArt name="bubbles" />
        <section aria-labelledby="state-affairs-dispatches" className="min-w-0 md:row-span-2 md:grid md:grid-rows-subgrid">
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
      {brandsStories.length > 0 && (
      <section
        aria-labelledby="brands-smes"
        className="relative isolate mx-auto mt-20 w-full max-w-[90rem] px-5 md:mt-28 md:px-10 xl:px-16"
      >
        <SectionArt name="network" />
        <SectionHeader
          id="brands-smes"
          title="Brands & SMEs"
          href="/category/brands-smes"
          linkLabel="View all"
        />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
          {brandsStories.map((story) => (
            <OverlayCard
              key={story.slug || story.id}
              name={story.title}
              category={story.categoryName || story.category}
              href={`/article/${story.slug}`}
              readTime={story.readTime}
              author={authorName(story)}
              showCategory={false}
              imageUrl={story.featuredImage?.url}
            />
          ))}
        </div>
      </section>
      )}

      {/* Multi-channel Media Distribution Network Strip */}
      <MediaDistributionStrip />

      {/* Cultural Dossier & Longform In-Depth */}
      <EditorialDossier />
    </>
  );
}
