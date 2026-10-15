import Ticker from "@/components/site/Ticker";
import Hero from "@/components/site/Hero";
import IndexList from "@/components/site/IndexList";
import FieldNotes from "@/components/site/FieldNotes";
import FigureCard from "@/components/site/FigureCard";
import MediaDistributionStrip from "@/components/site/MediaDistributionStrip";
import EditorialDossier from "@/components/site/EditorialDossier";
import Pill from "@/components/site/Pill";

const FEATURED_STORIES = [
  {
    name: "Federal Ministry of Transport Finalizes Comprehensive Inter-State Safety Standard",
    category: "CURRENT AFFAIRS",
    readTime: "3 min",
  },
  {
    name: "Practical Advisory: Distribution Companies Commence Phase 2 Direct Meter Rollout",
    category: "PRACTICAL UPDATES",
    readTime: "4 min",
  },
  {
    name: "Commercial Lenders Expand Sovereign Local-Currency Trade Facilities",
    category: "BUSINESS & INSTITUTIONS",
    readTime: "5 min",
  },
  {
    name: "Stories & Romance: Letters on Awolowo Road and the Intimacy of Modern Distance",
    category: "STORIES & ROMANCE",
    readTime: "4 min",
  },
];

export default function Home() {
  return (
    <>
      <Ticker />
      <Hero />
      <IndexList />

      {/* Flagship Coverage: Current Affairs & Practical Updates Grid */}
      <div className="mx-auto mt-16 grid w-full max-w-[90rem] gap-12 px-5 md:mt-24 md:grid-cols-[1.35fr_1fr] md:gap-14 md:px-10 xl:px-16">
        <section aria-labelledby="featured-dispatches">
          <div className="flex items-center justify-between pb-4 text-ink-soft">
            <h2 id="featured-dispatches" className="label text-ink-soft">
              Policy Announcements &amp; Practical Updates
            </h2>
            <Pill href="/category/nigerian-current-affairs" variant="ghost">
              All Current Affairs
            </Pill>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6">
            {FEATURED_STORIES.map((story, i) => (
              <FigureCard
                key={story.name}
                index={i + 1}
                name={story.name}
                category={story.category}
                readTime={story.readTime}
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
