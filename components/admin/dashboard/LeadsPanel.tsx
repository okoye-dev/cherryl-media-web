import Link from "next/link";
import { Btn, Panel, Pagination } from "@/components/admin/ui";
import type { StoryLead } from "@/lib/leads";

interface Props {
  leads: StoryLead[];
  busy: boolean;
  page: number;
  info: { total: number; totalPages: number; pageSize: number };
  onPage: (page: number) => void;
  onQuickPublish: (lead: StoryLead) => void;
}

const EMPTY = "rounded-lg border border-dashed border-white/10 px-4 py-8 text-center text-sm text-zinc-400";

export default function LeadsPanel({ leads, busy, page, info, onPage, onQuickPublish }: Props) {
  return (
    <Panel tone="ai" title="AI leads" description="Story ideas found by AI. Open one to edit it, or publish it straight away.">
      {busy && leads.length === 0 ? (
        <p className={EMPTY}>Loading leads...</p>
      ) : leads.length === 0 ? (
        <p className={EMPTY}>No leads yet. New ideas will show up here.</p>
      ) : (
        <>
          <ul className="-mx-2 divide-y divide-white/[0.06] sm:-mx-1">
            {leads.map((c) => (
              <li key={c.id} className="relative flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-white/[0.05] sm:px-3">
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[0.7rem] text-zinc-500">
                    <span className="font-medium text-brand-red/90">{c.category}</span>
                    {c.relevance !== null && <span className="text-emerald-400">{c.relevance}%</span>}
                    <span>
                      {c.sources} {c.sources === 1 ? "source" : "sources"}
                    </span>
                    <span>
                      {c.facts} {c.facts === 1 ? "fact" : "facts"}
                    </span>
                    {c.hasDraft && <span className="text-violet-300">Draft ready</span>}
                  </p>
                  <h3 className="mt-0.5 line-clamp-2 text-sm font-medium leading-snug text-zinc-100 sm:line-clamp-1">
                    <Link href={`/admin/editor?candidate=${encodeURIComponent(c.id)}`} className="after:absolute after:inset-0">
                      {c.title}
                    </Link>
                  </h3>
                </div>
                <Btn size="sm" className="relative z-10 !h-10 sm:!h-9" onClick={() => onQuickPublish(c)}>
                  Quick publish
                </Btn>
              </li>
            ))}
          </ul>
          <Pagination className="mt-3" page={page} totalPages={info.totalPages} total={info.total} pageSize={info.pageSize} onPage={onPage} busy={busy} />
        </>
      )}
    </Panel>
  );
}
