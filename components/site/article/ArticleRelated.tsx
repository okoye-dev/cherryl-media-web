import Link from "next/link";
import { resolveMediaUrl } from "@/lib/url-utils";
import type { CanonicalArticle } from "@/lib/types";

type RelatedItem = {
  slug?: string;
  url?: string;
  title?: string;
  deck?: string;
  category?: string;
  imageUrl?: string;
};

export default function ArticleRelated({ stories }: { stories?: CanonicalArticle["related_stories"] }) {
  if (!stories || stories.length === 0) return null;

  return (
    <div className="mt-12 border-t border-ink/10 pt-8">
      <div className="flex items-center justify-between pb-4">
        <h3 className="font-area text-lg font-semibold tracking-tight text-ink">More Stories</h3>
        <span className="label text-[0.65rem] font-medium text-brand-red uppercase">Curated Reading</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {stories.map((story, i) => {
          const item = story as RelatedItem;
          const href = item.slug ? `/article/${item.slug}` : item.url || "#";
          return (
            <Link
              key={i}
              href={href}
              className="group block rounded-2xl border border-ink/10 bg-paper/50 p-4 transition-all duration-300 hover:border-brand-red/30 hover:bg-paper"
            >
              {item.imageUrl && (
                <div className="aspect-[16/9] w-full overflow-hidden rounded-xl bg-paper-deep mb-3 border border-ink/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolveMediaUrl(item.imageUrl)}
                    alt={item.title || ""}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              )}
              {item.category && (
                <span className="label text-[0.62rem] font-semibold uppercase tracking-wider text-brand-red">{item.category}</span>
              )}
              <h4 className="mt-1 font-area font-bold text-sm md:text-base leading-snug text-ink group-hover:text-brand-red transition-colors line-clamp-2">
                {item.title}
              </h4>
              {item.deck && <p className="mt-1.5 text-xs text-ink-soft leading-relaxed line-clamp-2">{item.deck}</p>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
