import Link from "next/link";
import { getOpinionColumns } from "@/lib/news";
import Arrow from "./Arrow";
import Pill from "./Pill";

export default async function FieldNotes() {
  const opinionColumns = await getOpinionColumns();

  return (
    <section aria-labelledby="opinion-notes">
      <div className="flex items-center justify-between pb-4 text-ink-soft">
        <h2 id="opinion-notes" className="label text-ink-soft">
          Narratives &amp; Perspectives
        </h2>
        <Pill href="/category/stories-romance" variant="red-ghost">
          All Stories &amp; Romance
        </Pill>
      </div>
      <ol className="border-t border-ink/15 divide-y divide-ink/10">
        {opinionColumns.map((col, i) => (
          <li key={col.slug}>
            <Link
              href={`/article/${col.slug}`}
              className="group grid grid-cols-[1.75rem_1fr_auto] items-baseline gap-x-3 py-3 md:py-4 transition-colors"
            >
              <span className="font-num text-[0.7rem] font-medium text-brand-red">
                0{i + 1}
              </span>
              <div>
                <span className="label text-[0.65rem] font-medium text-ink-soft block">
                  {col.category} · By {typeof col.author === "string" ? col.author : col.author.name}
                </span>
                <span className="mt-1 block font-display text-[1.05rem] font-normal leading-snug tracking-[-0.01em] text-ink transition-colors duration-300 group-hover:italic group-hover:text-brand-red md:text-[1.18rem]">
                  {col.title}
                </span>
              </div>
              <Arrow className="h-3 w-3 self-center text-ink-soft transition-all duration-150 ease-out group-hover:translate-x-0.5 group-hover:rotate-[15deg] group-hover:text-brand-red" />
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
