import Link from "next/link";
import { SITE } from "@/config/site";

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
              className="group grid grid-cols-[2.5rem_1fr] items-center gap-4 py-4 md:grid-cols-[3.5rem_18rem_1fr] lg:grid-cols-[4rem_21rem_1fr] md:gap-8 md:py-4.5"
            >
              <span className="font-num text-xs font-semibold text-brand-red md:text-sm leading-none">
                0{i + 1}
              </span>

              <div>
                <span className="block font-area text-[clamp(1.05rem,1.7vw,1.35rem)] font-semibold leading-snug tracking-[-0.02em] text-ink transition-all duration-200 group-hover:italic group-hover:text-brand-red">
                  {cat.name}
                </span>
              </div>

              <p className="hidden text-xs font-normal leading-relaxed text-ink/75 md:block line-clamp-1">
                {cat.summary}
              </p>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
