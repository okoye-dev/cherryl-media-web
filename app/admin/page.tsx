"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchArticlesPage, fetchCandidatesPage } from "@/services/articles";
import { SITE } from "@/config/site";
import { Btn, Panel, PageTitle, Badge, Tabs, Pagination } from "@/components/admin/ui";
import type { CanonicalArticle } from "@/lib/types";
import QuickPublishSheet from "@/components/admin/dashboard/QuickPublishSheet";
import { leadToArticle, type RawLead } from "@/lib/leadToArticle";
import { formatCategoryName } from "@/lib/formatters";

interface StoryLead {
  id: string;
  title: string;
  pitch: string;
  category: string;
  relevance: number | null;
  sources: number;
  facts: number;
  hasDraft: boolean;
  raw?: RawLead;
}

type Filter = "all" | "published" | "draft";

function authorOf(a: CanonicalArticle) {
  return typeof a.author === "string" ? a.author : a.author?.name;
}

const niceCategory = (v: string) => formatCategoryName(v);

function formatDate(a: CanonicalArticle) {
  const raw = a.updatedAt || a.publishedAt;
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function StatusBadge({ status }: { status: string }) {
  return <Badge tone={status === "published" ? "green" : "amber"}>{status === "published" ? "Published" : "Draft"}</Badge>;
}

const STORY_PAGE = 10;
const LEAD_PAGE = 8;

function toLead(c: RawLead, i: number): StoryLead {
  const score = typeof c.relevanceScore === "number" ? c.relevanceScore : null;
  return {
    id: c.id || `lead-${i}`,
    title: c.headline || "Untitled lead",
    pitch: c.pitch || "",
    category: niceCategory(c.category || "General"),
    relevance: score === null ? null : Math.round(score <= 1 ? score * 100 : score),
    sources: Array.isArray(c.sources) ? c.sources.length : 0,
    facts: Array.isArray(c.extractedFacts) ? c.extractedFacts.length : 0,
    hasDraft: Array.isArray(c.suggestedDraft) && c.suggestedDraft.length > 0,
    raw: c,
  };
}

export default function AdminDashboardPage() {
  // Stories: one server page at a time, filtered by status on the server.
  const [articles, setArticles] = useState<CanonicalArticle[]>([]);
  const [statusFilter, setStatusFilter] = useState<Filter>("all");
  const [storyPage, setStoryPage] = useState(1);
  const [storyInfo, setStoryInfo] = useState({ total: 0, totalPages: 1, pageSize: STORY_PAGE });
  const [counts, setCounts] = useState({ all: 0, published: 0, draft: 0 });
  const [storiesBusy, setStoriesBusy] = useState(true);
  // Leads: also one server page at a time.
  const [candidates, setCandidates] = useState<StoryLead[]>([]);
  const [leadPage, setLeadPage] = useState(1);
  const [leadInfo, setLeadInfo] = useState({ total: 0, totalPages: 1, pageSize: LEAD_PAGE });
  const [leadsBusy, setLeadsBusy] = useState(true);
  const [reload, setReload] = useState(0);
  const [quick, setQuick] = useState<{ draft: Partial<CanonicalArticle>; editHref: string; from: "lead" | "draft"; leadId?: string } | null>(null);

  // The three tab counts come from the server totals (three one-item requests).
  useEffect(() => {
    let alive = true;
    Promise.all(["all", "published", "draft"].map((st) => fetchArticlesPage({ status: st, page: 1, pageSize: 1 })))
      .then(([all, pub, dr]) => alive && setCounts({ all: all.total, published: pub.total, draft: dr.total }))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [reload]);

  useEffect(() => {
    let alive = true;
    setStoriesBusy(true);
    fetchArticlesPage({ status: statusFilter, page: storyPage, pageSize: STORY_PAGE })
      .then((r) => {
        if (!alive) return;
        setArticles(r.items);
        setStoryInfo({ total: r.total, totalPages: r.totalPages, pageSize: r.pageSize });
      })
      .catch(() => {})
      .finally(() => alive && setStoriesBusy(false));
    return () => {
      alive = false;
    };
  }, [statusFilter, storyPage, reload]);

  useEffect(() => {
    let alive = true;
    setLeadsBusy(true);
    fetchCandidatesPage({ page: leadPage, pageSize: LEAD_PAGE })
      .then((r) => {
        if (!alive) return;
        setCandidates((r.items as RawLead[]).map(toLead));
        setLeadInfo({ total: r.total, totalPages: r.totalPages, pageSize: r.pageSize });
      })
      .catch(() => {})
      .finally(() => alive && setLeadsBusy(false));
    return () => {
      alive = false;
    };
  }, [leadPage, reload]);

  const publishedCount = counts.published;
  const draftsCount = counts.draft;
  const filteredArticles = articles;
  const visibleLeads = candidates;
  const openLeads = candidates;

  const stats = [
    { label: "Published", value: publishedCount, tone: "text-emerald-400" },
    { label: "Drafts", value: draftsCount, tone: "text-amber-400" },
    { label: "Categories", value: SITE.categories.length, tone: "text-white" },
    { label: "Leads", value: leadInfo.total, tone: "text-violet-300" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageTitle
        title="Stories"
        actions={
          <Btn href="/admin/editor" variant="primary" block>
            Write story
          </Btn>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-white/[0.08] bg-[#16181D] px-3.5 py-2.5 sm:px-4 sm:py-3">
            <p className="text-xs text-zinc-400">{s.label}</p>
            <p className={`mt-0.5 font-num text-xl font-semibold ${s.tone}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <Panel tone="ai" title="AI leads" description="Story ideas found by AI. Open one to edit it, or publish it straight away.">
        {leadsBusy && openLeads.length === 0 ? (
          <p className="rounded-lg border border-dashed border-white/10 px-4 py-8 text-center text-sm text-zinc-400">Loading leads...</p>
        ) : openLeads.length === 0 ? (
          <p className="rounded-lg border border-dashed border-white/10 px-4 py-8 text-center text-sm text-zinc-400">
            No leads yet. New ideas will show up here.
          </p>
        ) : (
          <>
            <ul className="-mx-2 divide-y divide-white/[0.06] sm:-mx-1">
              {visibleLeads.map((c) => (
                <li
                  key={c.id}
                  className="relative flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-white/[0.05] sm:px-3"
                >
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
                  <Btn
                    size="sm"
                    className="relative z-10 !h-10 sm:!h-9"
                    onClick={() =>
                      setQuick({
                        draft: leadToArticle(c.raw || { headline: c.title, pitch: c.pitch }),
                        editHref: `/admin/editor?candidate=${encodeURIComponent(c.id)}`,
                        from: "lead",
                        leadId: c.id,
                      })
                    }
                  >
                    Quick publish
                  </Btn>
                </li>
              ))}
            </ul>
            <Pagination className="mt-3" page={leadPage} totalPages={leadInfo.totalPages} total={leadInfo.total} pageSize={leadInfo.pageSize} onPage={setLeadPage} busy={leadsBusy} />
          </>
        )}
      </Panel>

      <Panel
        title="Your stories"
        actions={
          <Tabs<Filter>
            value={statusFilter}
            onChange={(f) => {
              setStatusFilter(f);
              setStoryPage(1);
            }}
            items={[
              { id: "all", label: "All", count: counts.all },
              { id: "published", label: "Published", count: counts.published },
              { id: "draft", label: "Drafts", count: counts.draft },
            ]}
          />
        }
      >
        {storiesBusy && filteredArticles.length === 0 ? (
          <p className="rounded-lg border border-dashed border-white/10 px-4 py-8 text-center text-sm text-zinc-400">Loading stories...</p>
        ) : filteredArticles.length === 0 ? (
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
            {/* Card list below lg */}
            <ul className="space-y-2.5 sm:space-y-3 lg:hidden">
              {filteredArticles.map((a) => (
                <li
                  key={a.id}
                  className="relative rounded-xl border border-white/[0.08] bg-[#121317] p-3 transition-colors hover:bg-white/[0.04] sm:p-4"
                >
                  {/* The status sits right beside the category, not at the far edge, so it reads with the title below */}
                  <div className="flex items-center gap-2">
                    <StatusBadge status={a.status} />
                    <p className="min-w-0 truncate text-xs font-medium text-brand-red">{niceCategory(a.categoryName)}</p>
                  </div>
                  <h3 className="mt-1.5 text-sm font-semibold leading-snug text-zinc-100">
                    <Link href={`/admin/editor?slug=${encodeURIComponent(a.slug)}`} className="after:absolute after:inset-0 after:rounded-xl">
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
                      <Btn
                        size="sm"
                        className="relative z-10 -my-1 !h-10"
                        onClick={() => setQuick({ draft: a, editHref: `/admin/editor?slug=${encodeURIComponent(a.slug)}`, from: "draft" })}
                      >
                        Quick publish
                      </Btn>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {/* Table from lg */}
            <div className="hidden lg:block">
              <div className="grid grid-cols-[minmax(0,1fr)_11rem_6rem_7rem_8rem] gap-4 border-b border-white/[0.08] px-3 pb-2 text-xs font-medium text-zinc-400">
                <span>Headline</span>
                <span>Category</span>
                <span>Status</span>
                <span>Updated</span>
                <span className="sr-only">Actions</span>
              </div>
              <ul className="divide-y divide-white/[0.06]">
                {filteredArticles.map((a) => (
                  <li
                    key={a.id}
                    className="relative grid grid-cols-[minmax(0,1fr)_11rem_6rem_7rem_8rem] items-center gap-4 px-3 py-3 text-sm transition-colors hover:bg-white/[0.04]"
                  >
                    <Link
                      href={`/admin/editor?slug=${encodeURIComponent(a.slug)}`}
                      className="truncate font-medium text-zinc-100 after:absolute after:inset-0"
                    >
                      {a.title}
                    </Link>
                    <span className="truncate text-xs text-zinc-400">{niceCategory(a.categoryName)}</span>
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
                        <Btn
                          size="sm"
                          className="relative z-10 !h-9"
                          onClick={() => setQuick({ draft: a, editHref: `/admin/editor?slug=${encodeURIComponent(a.slug)}`, from: "draft" })}
                        >
                          Quick publish
                        </Btn>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <Pagination
              className="mt-4"
              page={storyPage}
              totalPages={storyInfo.totalPages}
              total={storyInfo.total}
              pageSize={storyInfo.pageSize}
              onPage={setStoryPage}
              busy={storiesBusy}
            />
          </>
        )}
      </Panel>

      {quick && (
        <QuickPublishSheet
          draft={quick.draft}
          editHref={quick.editHref}
          from={quick.from}
          onClose={() => setQuick(null)}
          onPublished={() => {
            // Reload the counts and both lists from the server so the new story or draft appears
            setReload((n) => n + 1);
          }}
        />
      )}
    </div>
  );
}
