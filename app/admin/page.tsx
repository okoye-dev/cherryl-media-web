import Link from "next/link";
import { CANONICAL_ARTICLES } from "@/lib/articles";
import { SITE } from "@/config/site";

const INGESTED_CANDIDATES = [
  {
    id: "cand-01",
    title: "Federal Ministry of Transport Directs Regional Rail Link Feasibility Review",
    source: "Federal Gazette Feed",
    freshness: "14m ago",
    confidence: "Confirmed",
    category: "Nigerian Current Affairs",
    status: "Ready to write",
  },
  {
    id: "cand-02",
    title: "DisCos Issue Consumer Advisory on Prepaid Smart Meter Firmware Upgrades",
    source: "NERC Official Feed",
    freshness: "42m ago",
    confidence: "Official Release",
    category: "Practical Nigerian Updates",
    status: "Draft Ready",
  },
  {
    id: "cand-03",
    title: "Nollywood Independent Producers Conclude Historic Co-Production Deal",
    source: "Film Guild Statement",
    freshness: "2h ago",
    confidence: "Verified",
    category: "Entertainment & Internet Culture",
    status: "Needs Fact Check",
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header bar */}
      <div className="flex flex-col gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="label font-medium text-brand-red">NEWSROOM DESK</span>
          <h1 className="mt-1 font-display text-2xl font-normal text-white sm:text-3xl">
            Stories &amp; Publishing Control
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/editor"
            className="rounded-full bg-brand-red px-5 py-2 text-xs font-medium text-white shadow transition-opacity hover:opacity-90"
          >
            + Write New Story
          </Link>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-[#131B2B] p-5 shadow-sm">
          <span className="label font-medium text-slate-400">PUBLISHED STORIES</span>
          <div className="mt-2 font-display text-3xl font-normal text-white">
            {CANONICAL_ARTICLES.length}
          </div>
          <span className="mt-1 block text-xs text-slate-400">Live on publication website</span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#131B2B] p-5 shadow-sm">
          <span className="label font-medium text-slate-400">EDITORIAL CATEGORIES</span>
          <div className="mt-2 font-display text-3xl font-normal text-white">
            {SITE.categories.length}
          </div>
          <span className="mt-1 block text-xs text-slate-400">Active publication pillars</span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#131B2B] p-5 shadow-sm">
          <span className="label font-medium text-slate-400">SOCIAL CHANNELS</span>
          <div className="mt-2 font-display text-3xl font-normal text-white">5</div>
          <span className="mt-1 block text-xs font-medium text-emerald-400">
            Website · X · Facebook · LinkedIn · Newsletter
          </span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#131B2B] p-5 shadow-sm">
          <span className="label font-medium text-slate-400">STORY IDEAS &amp; LEADS</span>
          <div className="mt-2 font-display text-3xl font-normal text-brand-red">
            {INGESTED_CANDIDATES.length}
          </div>
          <span className="mt-1 block text-xs text-slate-400">Awaiting editor review</span>
        </div>
      </div>

      {/* Story Ideas Inbox */}
      <section className="rounded-2xl border border-slate-800 bg-[#131B2B] p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="font-display text-lg font-normal text-white sm:text-xl">
              Story Ideas &amp; Submissions
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Verified public updates and feeds ready for editorial selection and drafting.
            </p>
          </div>
          <span className="rounded-full bg-slate-800/80 px-3 py-1 font-mono text-[0.7rem] text-slate-300">
            Feed Poller: Active
          </span>
        </div>

        <div className="mt-4 divide-y divide-slate-800/80">
          {INGESTED_CANDIDATES.map((cand) => (
            <div key={cand.id} className="flex flex-col justify-between gap-4 py-4 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="label text-[0.62rem] font-medium text-brand-red">{cand.category}</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-400">{cand.source}</span>
                  <span className="text-slate-500">·</span>
                  <span className="font-num text-[0.7rem] text-slate-400">{cand.freshness}</span>
                </div>
                <h3 className="mt-1 text-sm font-medium text-slate-100 sm:text-base">
                  {cand.title}
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[0.68rem] font-medium text-emerald-400 border border-emerald-500/20">
                  {cand.confidence}
                </span>
                <Link
                  href={`/admin/editor?candidate=${cand.id}`}
                  className="rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:border-brand-red hover:text-brand-red"
                >
                  Start Writing →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Published & Approved Articles */}
      <section className="rounded-2xl border border-slate-800 bg-[#131B2B] p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="font-display text-lg font-normal text-white sm:text-xl">
              Published &amp; Scheduled Stories
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Active articles with formatted copy for social media and newsletter.
            </p>
          </div>
          <Link
            href="/admin/editor"
            className="text-xs font-medium text-brand-red hover:underline"
          >
            + Write Story
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="py-3">Headline</th>
                <th className="py-3">Category</th>
                <th className="py-3">Author</th>
                <th className="py-3">Status</th>
                <th className="py-3">Channels</th>
                <th className="py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {CANONICAL_ARTICLES.map((art) => (
                <tr key={art.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 pr-4 font-medium text-slate-200 max-w-sm truncate">
                    <Link href={`/admin/editor?slug=${art.slug}`} className="hover:text-brand-red">
                      {art.title}
                    </Link>
                  </td>
                  <td className="py-3.5 pr-4 text-slate-400">{art.categoryName}</td>
                  <td className="py-3.5 pr-4 text-slate-400">{art.author.name}</td>
                  <td className="py-3.5 pr-4">
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[0.68rem] font-medium uppercase tracking-wider text-emerald-400 border border-emerald-500/20">
                      {art.status}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-1.5 font-mono text-[0.68rem] text-slate-400">
                      {art.channelVariants?.x && <span className="rounded bg-slate-800 px-1 py-0.5" title="X">X</span>}
                      {art.channelVariants?.facebook && <span className="rounded bg-slate-800 px-1 py-0.5" title="Facebook">FB</span>}
                      {art.channelVariants?.linkedin && <span className="rounded bg-slate-800 px-1 py-0.5" title="LinkedIn">LI</span>}
                      {art.channelVariants?.newsletter && <span className="rounded bg-slate-800 px-1 py-0.5" title="Newsletter">NL</span>}
                    </div>
                  </td>
                  <td className="py-3.5 text-right space-x-3">
                    <Link
                      href={`/admin/editor?slug=${art.slug}`}
                      className="font-medium text-brand-red hover:underline"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/article/${art.slug}`}
                      target="_blank"
                      className="text-slate-400 hover:text-white hover:underline"
                    >
                      View ↗
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
