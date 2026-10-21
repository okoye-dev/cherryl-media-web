import Link from "next/link";
import { getLeadStory, getDispatches } from "@/services/public-articles";
import { fetchEditorialCopy } from "@/services/settings";
import { formatDate, formatCategoryName } from "@/lib/formatters";

export default async function Ticker() {
  const [lead, dispatches, copy] = await Promise.all([
    getLeadStory(),
    getDispatches(),
    fetchEditorialCopy(),
  ]);

  const items = [
    ...(copy.ticker.customNotice && lead
      ? [{ tag: "SPECIAL WIRE", title: copy.ticker.customNotice, slug: lead.slug }]
      : []),
    ...(lead ? [{ tag: "BREAKING", title: lead.title, slug: lead.slug }] : []),
    ...dispatches.map((d) => ({
      tag: formatCategoryName(d.categoryName || d.category),
      title: d.title,
      slug: d.slug,
    })),
  ];

  return (
    <div className="relative z-20 flex w-full items-center overflow-hidden border-b border-ink/10 bg-paper-deep/60 py-2.5 text-xs text-ink">
      <div className="flex shrink-0 items-center gap-2 border-r border-ink/15 px-4 md:px-6">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-red" />
        <span className="font-num font-medium tracking-wider text-brand-red uppercase">
          {copy.ticker.label || "LIVE WIRE"}
        </span>
      </div>


      <div className="flex-1 overflow-hidden">
        <div className="animate-ticker flex items-center gap-8 pl-4">
          {[...items, ...items].map((item, idx) => (
            <Link
              key={idx}
              href={`/article/${item.slug}`}
              className="flex shrink-0 items-center gap-3 transition-colors hover:text-brand-red"
            >
              <span className="rounded bg-ink/10 px-1.5 py-0.5 text-[0.65rem] font-medium tracking-wide uppercase text-ink-soft">
                {item.tag}
              </span>
              <span className="font-sans font-normal text-ink">
                {item.title}
              </span>
              <span className="text-ink-soft/40">/</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="hidden shrink-0 border-l border-ink/15 px-4 font-num text-[0.72rem] text-ink-soft md:block">
        {lead?.publishedAt ? formatDate(lead.publishedAt) : new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </div>
    </div>
  );
}
