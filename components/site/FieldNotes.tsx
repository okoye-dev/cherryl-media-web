import Link from "next/link";
import { getOpinionColumns } from "@/lib/news";
import { getCuratedSections } from "@/lib/sections";
import { formatCategoryName, authorName } from "@/lib/formatters";
import SectionHeader from "./SectionHeader";

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
    <section aria-labelledby="opinion-notes" className="min-w-0">
      <SectionHeader
        id="opinion-notes"
        title="Opinions & Perspectives"
        href="/category/opinions"
        linkLabel="All opinions"
      />
      <ul className="divide-y divide-ink/10">
        {opinionColumns.map((col) => {
          const name = authorName(col);
          return (
            <li key={col.slug}>
              <Link href={`/article/${col.slug}`} className="group block py-4 md:py-5">
                <span className="label block text-[0.6rem] font-medium leading-none text-ink-soft/70">
                  {formatCategoryName(col.categoryName || col.category)}
                  {name ? ` · ${name}` : ""}
                </span>
                <span className="mt-2 block font-area text-[1.02rem] font-semibold leading-snug tracking-[-0.02em] text-ink transition-all duration-200 group-hover:italic group-hover:text-brand-red md:text-[1.15rem]">
                  {col.title}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
