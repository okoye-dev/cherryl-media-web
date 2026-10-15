import type { Metadata } from "next";
import PageHeader from "@/components/site/PageHeader";
import Pill from "@/components/site/Pill";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: `About & Editorial Charter | ${SITE.name}`,
  description: "Cherryl Media is an independent digital news organization and multi-channel media distribution network.",
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        label="Editorial Charter & Network"
        title={
          <>
            Independent journalism for a <em className="italic text-brand-red">shifting continent</em>.
          </>
        }
        intro="Cherryl Media operates at the intersection of rigorous public-interest reporting, sub-national governance accountability, and new-age media distribution."
      />

      <div className="mx-auto w-full max-w-[90rem] px-5 pt-12 pb-24 md:px-10 xl:px-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_380px] lg:gap-16">
          <div className="space-y-12">
            <section className="space-y-4">
              <span className="label text-brand-red">OUR MISSION</span>
              <h2 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-light leading-tight tracking-tight text-ink">
                Closing the intelligence gap between grassroots realities and policy decision-makers.
              </h2>
              <p className="text-base font-light leading-relaxed text-ink/80 md:text-lg">
                Founded with a conviction that modern African stories require unapologetic clarity and data-grounded depth, Cherryl Media maintains seven dedicated newsroom desks. From sub-national state budget tracking to frontier technology and Nollywood cultural critique, we deliver dispatches built for high-conviction decision-making.
              </p>
            </section>

            <section className="space-y-6 border-t border-ink/10 pt-10">
              <span className="label text-brand-red">EDITORIAL DESKS</span>
              <div className="grid gap-6 sm:grid-cols-2">
                {SITE.categories.map((cat) => (
                  <div key={cat.slug} className="rounded-2xl border border-ink/10 bg-paper-deep/30 p-6">
                    <span className="font-num text-xs text-brand-red">{cat.channels ? cat.channels.join(" · ") : "Editorial Desk"}</span>
                    <h3 className="mt-2 font-display text-xl font-light text-ink">{cat.name}</h3>
                    <p className="mt-2 text-xs font-light leading-relaxed text-ink-soft">{cat.summary}</p>
                    <div className="mt-4">
                      <Pill href={`/category/${cat.slug}`} variant="ghost">View Desk</Pill>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-8">
            <div className="rounded-[1.75rem] border border-ink/10 bg-cream p-7">
              <span className="label text-brand-red">NEWSROOM STANDARDS</span>
              <ul className="mt-4 space-y-3 text-xs font-light text-ink/80">
                <li className="flex items-start gap-2">
                  <span className="text-brand-red font-bold">·</span>
                  <span><strong>Fact Verification:</strong> Multi-source verification for all sub-national dispatches.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-red font-bold">·</span>
                  <span><strong>Syndication Feed:</strong> Real-time API distribution for authorized newsrooms and research bodies.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-red font-bold">·</span>
                  <span><strong>Corrections:</strong> Transparent correction log on all published investigations.</span>
                </li>
              </ul>
            </div>

            <div className="rounded-[1.75rem] bg-ink p-7 text-paper">
              <span className="label text-brand-red">SYNDICATION &amp; ENQUIRIES</span>
              <p className="mt-3 text-xs font-light leading-relaxed text-paper/70">
                For newsroom tips, press releases, or syndication partnerships:
              </p>
              <div className="mt-5 space-y-3">
                <Pill href={`mailto:${SITE.email}`} variant="paper">
                  {SITE.email}
                </Pill>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
