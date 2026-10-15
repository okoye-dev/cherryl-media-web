import Link from "next/link";
import Arrow from "./Arrow";
import Pill from "./Pill";

export default function EditorialDossier() {
  return (
    <section className="mx-auto mt-20 w-full max-w-[90rem] px-5 md:mt-32 md:px-10 xl:px-16" aria-labelledby="dossier-heading">
      <div className="flex flex-col gap-4 border-b border-ink/15 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="label-red font-medium">WEEKEND DOSSIER · ISSUE Nº 18</span>
          <h2 id="dossier-heading" className="mt-2 font-display text-[clamp(1.5rem,2.8vw,2.2rem)] font-normal leading-tight tracking-[-0.012em] text-ink">
            Culture, Cinema &amp; <em className="italic text-brand-red">Critical Essays</em>.
          </h2>
        </div>
        <Pill href="/category/entertainment-internet-culture" variant="ghost">
          All Culture Stories
        </Pill>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:gap-8">
        <article className="group flex flex-col justify-between rounded-[1.75rem] border border-ink/10 bg-cream p-7 transition-all duration-300 hover:border-brand-red/40 lg:col-span-5 lg:p-8">
          <div>
            <div className="flex items-center justify-between text-xs text-ink-soft">
              <span className="label text-brand-red font-semibold">THE BIG READ</span>
              <span className="font-num font-medium">7 min read</span>
            </div>

            <div className="mt-5 aspect-[16/10] w-full rounded-2xl border border-ink/10 bg-paper-deep/60 p-6 flex flex-col justify-between">
              <span className="label text-[0.65rem] font-medium text-ink-soft">PHOTO ESSAY ARCHIVE</span>
              <p className="font-display text-base md:text-lg font-normal italic text-ink/80">
                “We stopped negotiating for shelf space. We engineered the audience first.”
              </p>
              <span className="text-[0.7rem] font-medium text-ink-soft">Lagos Soundstages &amp; Studio Lots</span>
            </div>

            <h3 className="mt-5 font-display text-[1.25rem] md:text-[1.38rem] font-bold leading-snug tracking-[-0.01em] text-ink transition-colors duration-200 group-hover:text-brand-red">
              <Link href="/article/lagos-soundscapes-and-creators-revolution">
                The Nollywood Studio Architecture: From Direct-to-Video Roots to Global Distribution Dominance
              </Link>
            </h3>

            <p className="mt-3 text-sm font-normal leading-relaxed text-ink/80">
              How independent Nigerian showrunners, cinematographers, and production executives bypassed legacy syndication bottlenecks to build sovereign intellectual property empires.
            </p>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-ink/10 pt-4 text-xs font-medium text-ink-soft">
            <span>By Funke Balogun · Culture Bureau</span>
            <Arrow className="h-3 w-3 text-brand-red transition-transform duration-200 group-hover:translate-x-1" />
          </div>
        </article>

        <div className="flex flex-col justify-between gap-6 lg:col-span-4">
          <article className="group flex flex-1 flex-col justify-between rounded-[1.75rem] border border-ink/10 bg-cream p-6 transition-all duration-300 hover:border-brand-red/40">
            <div>
              <div className="flex items-center justify-between text-xs text-ink-soft">
                <span className="label text-brand-red font-semibold">SOUNDSCAPES</span>
                <span className="font-num font-medium">4 min read</span>
              </div>
              <h3 className="mt-3 font-display text-lg font-bold leading-snug tracking-tight text-ink transition-colors duration-200 group-hover:text-brand-red">
                <Link href="/category/entertainment-internet-culture">
                  Inside the Lagos Underground: The Sound Architects Engineering Polyphonic Afro-Fusion
                </Link>
              </h3>
              <p className="mt-2 text-xs font-normal leading-relaxed text-ink/70">
                A technical exploration into the rhythmic syncopations and modular synthesizers defining new West African acoustics.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-ink/10 pt-3 text-[0.75rem] text-ink-soft">
              <span>Acoustics &amp; Music Desk</span>
              <span className="font-num">Oct 14</span>
            </div>
          </article>

          <article className="group flex flex-1 flex-col justify-between rounded-[1.75rem] border border-ink/10 bg-cream p-6 transition-all duration-300 hover:border-brand-red/40">
            <div>
              <div className="flex items-center justify-between text-xs text-ink-soft">
                <span className="label text-brand-red">GASTRONOMY</span>
                <span className="font-num">5 min read</span>
              </div>
              <h3 className="mt-4 font-display text-xl font-bold leading-snug tracking-tight text-ink transition-colors duration-200 group-hover:text-brand-red">
                <Link href="/category/entertainment-internet-culture">
                  Fermentation, Coastal Smoke &amp; Heritage: The Contemporary Revival of Indigenous Grains
                </Link>
              </h3>
              <p className="mt-2 text-xs font-normal leading-relaxed text-ink/70">
                Culinary anthropologists and contemporary chefs recharting regional biodiversity across coastal markets.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-ink/10 pt-3 text-[0.75rem] text-ink-soft">
              <span>West African Culinary Desk</span>
              <span className="font-num">Oct 13</span>
            </div>
          </article>
        </div>

        <div className="flex flex-col rounded-[1.75rem] border border-ink/10 bg-paper-deep/30 p-6 lg:col-span-3">
          <div className="flex items-center justify-between border-b border-ink/10 pb-3">
            <span className="label text-brand-red">RADAR · DISPATCHES</span>
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-red" />
          </div>

          <ul className="mt-4 divide-y divide-ink/10">
            {[
              {
                num: "01",
                tag: "EXHIBITIONS",
                title: "Art X Lagos Finalizes 2026 Pavilions with 42 International Galleries",
                time: "2 min",
              },
              {
                num: "02",
                tag: "ARCHIVES",
                title: "Preserving Highlife Wax: The Vinyl Restorers Digitizing Vintage Accra Sessions",
                time: "4 min",
              },
              {
                num: "03",
                tag: "ARCHITECTURE",
                title: "Sahelian Earth Hubs: Passive Cooling Innovations in Urban Architecture",
                time: "3 min",
              },
              {
                num: "04",
                tag: "GRAPHIC NOVELS",
                title: "Independent Comics Guild Rewriting Regional Folklore for Young Audiences",
                time: "3 min",
              },
            ].map((item) => (
              <li key={item.num} className="group py-4 first:pt-2 last:pb-0">
                <Link href="/category/entertainment-internet-culture" className="block">
                  <div className="flex items-center justify-between">
                    <span className="label text-[0.62rem] text-brand-red">{item.tag}</span>
                    <span className="font-num text-[0.68rem] text-ink-soft">{item.time}</span>
                  </div>
                  <h4 className="mt-1.5 font-display text-[0.98rem] font-semibold leading-snug tracking-tight text-ink transition-colors duration-200 group-hover:text-brand-red">
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
