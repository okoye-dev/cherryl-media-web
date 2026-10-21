import Link from "next/link";
import { SITE } from "@/config/site";
import { cn } from "@/utils";

type Cat = (typeof SITE.categories)[number];

/**
 * Bento layout. Wide screens: a 6-column grid with the four main desks in the middle.
 * Phones: a 4-column grid with two big 2x2 tiles (State Affairs, Entertainment), wide tiles and small squares.
 * The "order" classes set the reading order for each layout. Each tile has its own faint tint,
 * and hovering deepens that same colour.
 */
const LAYOUT: Record<string, { span: string; text: string; tint: string; big?: boolean }> = {
  "youth-corner": { span: "col-span-2 order-[8] md:order-[1] md:col-span-1", text: "text-[0.9rem] md:text-[1.02rem]", tint: "bg-violet-500/10 border-violet-500/25 hover:bg-violet-500/25 dark:bg-violet-400/15 dark:border-violet-400/30 dark:hover:bg-violet-400/30" },
  newsbeat: { span: "col-span-2 order-[2] md:order-[2] md:col-span-2", text: "text-[1.1rem] md:text-[1.35rem]", tint: "bg-sky-500/15 border-sky-500/25 hover:bg-sky-500/30 dark:bg-sky-400/20 dark:border-sky-400/30 dark:hover:bg-sky-400/35", big: true },
  "brands-smes": { span: "col-span-2 order-[3] md:order-[3] md:col-span-2", text: "text-[1.1rem] md:text-[1.35rem]", tint: "bg-amber-500/15 border-amber-500/25 hover:bg-amber-500/30 dark:bg-amber-400/20 dark:border-amber-400/30 dark:hover:bg-amber-400/35", big: true },
  "tour-hotels": { span: "order-[10] md:order-[4] md:col-span-1", text: "text-[0.78rem] leading-tight md:text-[1.02rem]", tint: "bg-teal-500/10 border-teal-500/25 hover:bg-teal-500/25 dark:bg-teal-400/15 dark:border-teal-400/30 dark:hover:bg-teal-400/30" },
  "thrills-tricks": { span: "order-[9] md:order-[5] md:col-span-1", text: "text-[0.78rem] leading-tight md:text-[1.02rem]", tint: "bg-fuchsia-500/10 border-fuchsia-500/25 hover:bg-fuchsia-500/25 dark:bg-fuchsia-400/15 dark:border-fuchsia-400/30 dark:hover:bg-fuchsia-400/30" },
  "state-affairs-environs": { span: "col-span-2 row-span-2 order-[1] md:order-[6] md:col-span-4 md:row-span-1", text: "text-[1.55rem] md:text-[1.35rem]", tint: "bg-brand-red/15 border-brand-red/30 hover:bg-brand-red/30 dark:bg-brand-red/20 dark:hover:bg-brand-red/35", big: true },
  education: { span: "order-[6] md:order-[7] md:col-span-1", text: "text-[0.78rem] leading-tight md:text-[1.02rem]", tint: "bg-emerald-500/10 border-emerald-500/25 hover:bg-emerald-500/25 dark:bg-emerald-400/15 dark:border-emerald-400/30 dark:hover:bg-emerald-400/30" },
  sports: { span: "order-[5] md:order-[8] md:col-span-2", text: "text-[0.78rem] leading-tight md:text-[1.02rem]", tint: "bg-lime-500/10 border-lime-500/25 hover:bg-lime-500/25 dark:bg-lime-400/15 dark:border-lime-400/30 dark:hover:bg-lime-400/30" },
  opinions: { span: "col-span-2 order-[4] md:order-[9] md:col-span-2", text: "text-[1.1rem] md:text-[1.35rem]", tint: "bg-indigo-500/15 border-indigo-500/25 hover:bg-indigo-500/30 dark:bg-indigo-400/20 dark:border-indigo-400/30 dark:hover:bg-indigo-400/35", big: true },
  "entertainment-lifestyle": { span: "col-span-2 row-span-2 order-[7] md:order-[10] md:row-span-1 md:col-span-2", text: "text-[1.25rem] md:text-[1.02rem]", tint: "bg-rose-500/10 border-rose-500/25 hover:bg-rose-500/25 dark:bg-rose-400/15 dark:border-rose-400/30 dark:hover:bg-rose-400/30" },
};

/** Order matters on the grid: this is the reading order of the rows above. */
const ORDER = [
  "youth-corner", "newsbeat", "brands-smes", "tour-hotels",
  "thrills-tricks", "state-affairs-environs", "education",
  "sports", "opinions", "entertainment-lifestyle",
];

export default function IndexList() {
  const bySlug = new Map<string, Cat>(SITE.categories.map((c) => [c.slug, c]));

  return (
    <section
      aria-labelledby="desks-heading"
      className="mx-auto mt-14 w-full max-w-[64rem] px-5 md:mt-20 md:px-10"
    >
      <h2 id="desks-heading" className="label mb-4 w-full justify-center font-medium text-ink-soft">
        Browse all desks
      </h2>

      <div className="grid auto-rows-[4.6rem] grid-cols-4 gap-2 md:grid-cols-6 md:auto-rows-[6rem] md:gap-3">
        {ORDER.map((slug) => {
          const cat = bySlug.get(slug);
          const l = LAYOUT[slug];
          if (!cat || !l) return null;
          return (
            <Link
              key={slug}
              href={`/category/${slug}`}
              className={cn(
                "group flex flex-col justify-end rounded-2xl border p-3 transition-colors duration-300 md:p-4",
                l.tint,
                l.span,
              )}
            >
              <span
                className={cn("font-area font-semibold tracking-[-0.02em] text-ink", l.text)}
              >
                {cat.shortName}
              </span>
              {slug === "state-affairs-environs" && (
                <span className="mt-1 hidden line-clamp-1 text-xs text-ink/65 md:block">{cat.summary}</span>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
