import Link from "next/link";
import { Btn, Panel, Tabs, Pagination } from "@/components/admin/ui";
import { formatCategoryName } from "@/lib/formatters";
import type { CanonicalArticle } from "@/lib/types";
import type { StoryFilter } from "@/hooks/dashboard/useStories";
import StatusBadge from "./StatusBadge";
import { authorOf, formatDate } from "./storyFormat";

interface Props {
  articles: CanonicalArticle[];
  busy: boolean;
  filter: StoryFilter;
  onFilter: (f: StoryFilter) => void;
  counts: { all: number; published: number; draft: number };
  page: number;
  info: { total: number; totalPages: number; pageSize: number };
  onPage: (page: number) => void;
  onQuickPublish: (a: CanonicalArticle) => void;
}

const EMPTY = "rounded-lg border border-dashed border-white/10 px-4 py-8 text-center text-sm text-zinc-400";
const editHref = (a: CanonicalArticle) => `/admin/editor?slug=${encodeURIComponent(a.slug)}`;

export default function StoriesPanel({ articles, busy, filter, onFilter, counts, page, info, onPage, onQuickPublish }: Props) {
  return (
    <Panel
      title="Your stories"
      actions={
        <Tabs<StoryFilter>
          value={filter}
          onChange={onFilter}
          items={[
            { id: "all", label: "All", count: counts.all },
            { id: "published", label: "Published", count: counts.published },
            { id: "draft", label: "Drafts", count: counts.draft },
          ]}
        />
      }
    >
      {busy && articles.length === 0 ? (
        <p className={EMPTY}>Loading stories...</p>
      ) : articles.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/10 px-4 py-8 text-center">
          <p className="text-sm text-zinc-400">{counts.all === 0 ? "No stories yet." : "No stories in this view."}</p>
          {counts.all === 0 && (
            <div className="mt-4 flex justify-center">
              <Btn href="/admin/editor" variant="primary">
                Write story
              </Btn>
            </div>
          )}
        </div>
      ) : (
        <>
          <ul className="space-y-2.5 sm:space-y-3 lg:hidden">
            {articles.map((a) => (
              <li key={a.id} className="relative rounded-xl border border-white/[0.08] bg-[#121317] p-3 transition-colors hover:bg-white/[0.04] sm:p-4">
                <div className="flex items-center gap-2">
                  <StatusBadge status={a.status} small />
                  <p className="min-w-0 truncate text-xs font-medium leading-none text-brand-red">{formatCategoryName(a.categoryName)}</p>
                </div>
                <h3 className="mt-[9px] text-sm font-semibold leading-snug text-zinc-100">
                  <Link href={editHref(a)} className="after:absolute after:inset-0 after:rounded-xl">
                    {a.title}
                  </Link>
                </h3>
                <div className="mt-1.5 flex items-center justify-between gap-3 text-xs text-zinc-400">
                  <span className="min-w-0 truncate">
                    {authorOf(a) ? `${authorOf(a)}, ` : ""}
                    {formatDate(a)}
                  </span>
                  {a.status === "published" && (
                    <Link
                      href={`/article/${a.slug}`}
                      target="_blank"
                      className="relative z-10 -my-2 -mr-2 inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-lg px-3 font-medium text-zinc-200 hover:bg-white/10 hover:text-white"
                    >
                      View live
                    </Link>
                  )}
                  {a.status === "draft" && (
                    <Btn size="sm" className="relative z-10 -my-1 !h-10" onClick={() => onQuickPublish(a)}>
                      Quick publish
                    </Btn>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <div className="hidden lg:block">
            <div className="grid grid-cols-[minmax(0,1fr)_11rem_6rem_7rem_8rem] gap-4 border-b border-white/[0.08] px-3 pb-2 text-xs font-medium text-zinc-400">
              <span>Headline</span>
              <span>Category</span>
              <span>Status</span>
              <span>Updated</span>
              <span className="sr-only">Actions</span>
            </div>
            <ul className="divide-y divide-white/[0.06]">
              {articles.map((a) => (
                <li
                  key={a.id}
                  className="relative grid grid-cols-[minmax(0,1fr)_11rem_6rem_7rem_8rem] items-center gap-4 px-3 py-3 text-sm transition-colors hover:bg-white/[0.04]"
                >
                  <Link href={editHref(a)} className="truncate font-medium text-zinc-100 after:absolute after:inset-0">
                    {a.title}
                  </Link>
                  <span className="truncate text-xs text-zinc-400">{formatCategoryName(a.categoryName)}</span>
                  <span>
                    <StatusBadge status={a.status} />
                  </span>
                  <span className="text-xs text-zinc-400">{formatDate(a)}</span>
                  <span className="flex justify-end">
                    {a.status === "published" && (
                      <Link
                        href={`/article/${a.slug}`}
                        target="_blank"
                        className="relative z-10 inline-flex h-9 items-center whitespace-nowrap rounded-lg px-3 text-xs font-medium text-zinc-200 hover:bg-white/10 hover:text-white"
                      >
                        View live
                      </Link>
                    )}
                    {a.status === "draft" && (
                      <Btn size="sm" className="relative z-10 !h-9" onClick={() => onQuickPublish(a)}>
                        Quick publish
                      </Btn>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <Pagination className="mt-4" page={page} totalPages={info.totalPages} total={info.total} pageSize={info.pageSize} onPage={onPage} busy={busy} />
        </>
      )}
    </Panel>
  );
}
