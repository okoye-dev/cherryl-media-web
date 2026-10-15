import Pill from "./Pill";
import { SITE } from "@/config/site";

export default function MediaDistributionStrip() {
  return (
    <section
      id="distribution"
      className="mx-auto mt-16 w-full max-w-[90rem] px-5 md:mt-24 md:px-10 xl:px-16"
    >
      <div className="rounded-[2rem] bg-ink p-8 text-paper md:p-12">
        <div className="flex flex-col justify-between gap-6 border-b border-paper/15 pb-8 md:flex-row md:items-end">
          <div>
            <span className="label text-brand-red font-medium">
              NEW MEDIA NETWORK
            </span>
            <h2 className="mt-2 font-display text-[clamp(1.45rem,2.6vw,2.15rem)] font-normal leading-tight tracking-[-0.012em] text-paper">
              Multi-channel <em className="italic text-brand-red">distribution</em> for modern readers.
            </h2>
          </div>
          <p className="max-w-[36ch] text-sm font-normal leading-relaxed text-paper/80">
            Publishing stories, audio digests, and newsletters across website, social platforms, and subscriber channels.
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {SITE.mediaDistribution.map((channel, i) => (
            <div
              key={channel.title}
              className="group flex flex-col justify-between rounded-2xl border border-paper/10 bg-white/[0.03] p-6 transition-all duration-300 hover:border-brand-red/50 hover:bg-white/[0.06]"
            >
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-num text-brand-red font-medium">
                    0{i + 1}
                  </span>
                  <span className="rounded bg-paper/10 px-2 py-0.5 text-[0.65rem] uppercase tracking-wider text-paper/70 font-medium">
                    {channel.format}
                  </span>
                </div>
                <h3 className="mt-3 font-display text-lg font-normal text-paper transition-colors group-hover:text-brand-red">
                  {channel.title}
                </h3>
                <p className="mt-2 text-xs font-normal leading-relaxed text-paper/75">
                  {channel.description}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-paper/10 pt-4 text-[0.7rem] text-paper/50">
                <span>{channel.status}</span>
                <span className="text-paper transition-transform duration-200 group-hover:translate-x-1 group-hover:text-brand-red">
                  →
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-paper/10 pt-6">
          <span className="text-xs text-paper/60 font-light">
            Need syndication rights or automated API feeds for your newsroom?
          </span>
          <Pill href={`mailto:${SITE.email}`} variant="paper">
            Inquire for syndication
          </Pill>
        </div>
      </div>
    </section>
  );
}
