import Link from "next/link";
import { SITE } from "@/config/site";
import Arrow from "./Arrow";

export default function IndexList() {
  return (
    <section
      aria-labelledby="desks-heading"
      className="mx-auto mt-16 w-full max-w-[90rem] px-5 md:mt-24 md:px-10 xl:px-16"
    >
      <div className="flex items-center justify-between border-b border-ink/15 pb-4">
        <h2 id="desks-heading" className="label font-medium text-ink-soft">
          Editorial Categories &amp; Sections
        </h2>
        <span className="font-num text-xs text-brand-red font-medium">
          26,000+ STORY ARCHIVE
        </span>
      </div>

      <ol className="divide-y divide-ink/10">
        {SITE.categories.map((cat, i) => (
          <li key={cat.slug}>
            <Link
              href={`/category/${cat.slug}`}
              className="group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-4 py-4 md:grid-cols-[3.5rem_1.2fr_1.5fr_auto] md:gap-8 md:py-5"
            >
              <span className="font-num text-xs font-medium text-brand-red md:text-sm">
                0{i + 1}
              </span>

              <div>
                <span className="block font-display text-[clamp(1.15rem,2vw,1.55rem)] font-semibold leading-snug tracking-[-0.01em] text-ink transition-colors duration-200 group-hover:text-brand-red">
                  {cat.name}
                </span>
                <span className="font-num text-[0.72rem] font-medium text-ink-soft md:hidden">
                  {cat.channels ? cat.channels.join(" · ") : "Section"}
                </span>
              </div>

              <p className="hidden text-xs font-normal leading-relaxed text-ink/75 md:block">
                {cat.summary}
              </p>

              <div className="flex items-center gap-4">
                <span className="hidden font-num text-xs text-ink-soft group-hover:text-brand-red md:inline">
                  {cat.channels ? cat.channels.join(" · ") : "Desk"}
                </span>
                <Arrow className="h-3 w-3 text-ink-soft transition-all duration-200 group-hover:translate-x-1 group-hover:text-brand-red" />
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
