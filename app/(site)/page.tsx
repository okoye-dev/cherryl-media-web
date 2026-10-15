import Ticker from "@/components/site/Ticker";
import Hero from "@/components/site/Hero";
import IndexList from "@/components/site/IndexList";
import FieldNotes from "@/components/site/FieldNotes";
import FigureCard from "@/components/site/FigureCard";
import MediaDistributionStrip from "@/components/site/MediaDistributionStrip";
import EditorialDossier from "@/components/site/EditorialDossier";
import Pill from "@/components/site/Pill";
import { getCuratedSections } from "@/lib/sections";

export default async function Home() {
  const curated = await getCuratedSections();
  const featuredStories = curated.byKey?.featured_updates?.articles || [];

  return (
    <>
      <Ticker />
      <Hero />
      <IndexList />

      {/* Flagship Coverage: Current Affairs & Practical Updates Grid */}
      <div className="mx-auto mt-16 grid w-full max-w-[90rem] gap-12 px-5 md:mt-24 md:grid-cols-[1.35fr_1fr] md:gap-14 md:px-10 xl:px-16">
        <section aria-labelledby="featured-dispatches">
          <div className="flex items-center justify-between gap-3 pb-4 text-ink-soft">
            <h2 id="featured-dispatches" className="label text-ink-soft">
              Policy Announcements &amp; Practical Updates
            </h2>
            <Pill href="/category/nigerian-current-affairs" variant="ghost">
              All Current Affairs
            </Pill>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6">
            {featuredStories.map((story, i) => (
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

        <FieldNotes />
      </div>

      {/* Multi-channel Media Distribution Network Strip */}
      <MediaDistributionStrip />

      {/* Cultural Dossier & Longform In-Depth */}
      <EditorialDossier />
    </>
  );
}
