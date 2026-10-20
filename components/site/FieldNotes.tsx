import Link from "next/link";
import { getOpinionColumns } from "@/lib/news";
import { getCuratedSections } from "@/lib/sections";
import { formatCategoryName } from "@/lib/formatters";
import Pill from "./Pill";

export default async function FieldNotes() {
  const [curated, defaultOpinion] = await Promise.all([
    getCuratedSections(),
    getOpinionColumns(),
  ]);

  const opinionColumns =
    curated.byKey?.perspectives?.articles &&
    curated.byKey.perspectives.articles.length > 0
      ? curated.byKey.perspectives.articles
      : defaultOpinion;

  return (
    <section aria-labelledby="opinion-notes">
      <div className="flex items-center justify-between pb-4 text-ink-soft">
        <h2 id="opinion-notes" className="label text-ink-soft">
          Opinions &amp; Perspectives
        </h2>
        <Pill href="/category/opinions" variant="red-ghost">
          All Opinions
        </Pill>
      </div>
      <ol className="border-t border-ink/15 divide-y divide-ink/10">
        {opinionColumns.map((col, i) => (
          <li key={col.slug}>
            <Link
              href={`/article/${col.slug}`}
              className="group grid grid-cols-[1.75rem_1fr] items-baseline gap-x-3 py-3 md:py-4 transition-colors"
            >
              <span className="font-num text-[0.7rem] font-semibold text-brand-red leading-none">
                0{i + 1}
              </span>
              <div>
                <span className="label text-[0.6rem] font-medium text-ink-soft block leading-none">
                  {formatCategoryName(col.categoryName || col.category)} · By {typeof col.author === "string" ? col.author : col.author.name}
                </span>
                <span className="mt-1 block font-area text-[1.02rem] font-semibold leading-snug tracking-[-0.02em] text-ink transition-all duration-200 group-hover:italic group-hover:text-brand-red md:text-[1.15rem]">
                  {col.title}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
