"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CANONICAL_ARTICLES } from "@/lib/articles";
import { articleService } from "@/services";
import { SITE } from "@/config/site";
import type { CanonicalArticle } from "@/lib/types";

interface StoryLead {
  id: string;
  title: string;
  source: string;
  freshness: string;
  confidence: string;
  category: string;
  status: string;
}

const FALLBACK_CANDIDATES: StoryLead[] = [
  {
    id: "cand-01",
    title: "Federal Ministry of Transport Directs Regional Rail Link Feasibility Review",
    source: "Federal Gazette Feed",
    freshness: "14m ago",
    confidence: "Confirmed",
    category: "Current Affairs",
    status: "Ready to write",
  },
  {
    id: "cand-02",
    title: "DisCos Issue Consumer Advisory on Prepaid Smart Meter Firmware Upgrades",
    source: "NERC Official Feed",
    freshness: "42m ago",
    confidence: "Official Release",
    category: "Practical Updates",
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
  const [articles, setArticles] = useState<CanonicalArticle[]>(CANONICAL_ARTICLES);
  const [candidates, setCandidates] = useState<StoryLead[]>(FALLBACK_CANDIDATES);

  useEffect(() => {
    let isMounted = true;

    articleService
      .getArticles({ status: "all" })
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setArticles(data);
        }
      })
      .catch(() => {});

    articleService
      .getCandidates()
      .then((rawCandidates) => {
        if (isMounted && Array.isArray(rawCandidates) && rawCandidates.length > 0) {
          const mapped: StoryLead[] = rawCandidates.map((c, i) => ({
            id: c.id || `lead-${i}`,
            title: c.headline || "Untitled Lead",
            source: c.source || "Automated Discovery",
            freshness: c.freshness || "Recent",
            confidence: c.confidence || "High",
            category: c.category || "General",
            status: c.status || "Ready to write",
          }));
          setCandidates(mapped);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="label text-[0.68rem] font-semibold tracking-wider text-brand-red">NEWSROOM DESK</span>
          <h1 className="mt-1 font-sans text-2xl font-semibold text-white sm:text-3xl tracking-tight">
            Stories &amp; Publishing Control
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/settings"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-all"
          >
            Site Copy &amp; Config
          </Link>
          <Link
            href="/admin/editor"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-brand-red px-4 py-2 text-xs font-semibold text-white shadow transition-all hover:bg-brand-red/90"
          >
            + Write New Story
          </Link>
        </div>
      </div>


      {/* Metrics grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/[0.08] bg-[#16181D] p-4 sm:p-5 shadow-sm">
          <span className="label text-[0.62rem] font-semibold uppercase tracking-wider text-zinc-400">PUBLISHED STORIES</span>
          <div className="mt-2 font-num text-2xl sm:text-3xl font-semibold text-white">
            {articles.length}
          </div>
          <span className="mt-1 block text-[0.72rem] text-zinc-400">Live on publication website</span>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#16181D] p-4 sm:p-5 shadow-sm">
          <span className="label text-[0.62rem] font-semibold uppercase tracking-wider text-zinc-400">CATEGORIES</span>
          <div className="mt-2 font-num text-2xl sm:text-3xl font-semibold text-white">
            {SITE.categories.length}
          </div>
          <span className="mt-1 block text-[0.72rem] text-zinc-400">Active publication pillars</span>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#16181D] p-4 sm:p-5 shadow-sm">
          <span className="label text-[0.62rem] font-semibold uppercase tracking-wider text-zinc-400">CHANNELS</span>
          <div className="mt-2 font-num text-2xl sm:text-3xl font-semibold text-white">4</div>
          <span className="mt-1 block text-[0.72rem] font-medium text-emerald-400">
            Web · X · FB · LinkedIn
          </span>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#16181D] p-4 sm:p-5 shadow-sm">
          <span className="label text-[0.62rem] font-semibold uppercase tracking-wider text-zinc-400">STORY LEADS</span>
          <div className="mt-2 font-num text-2xl sm:text-3xl font-semibold text-brand-red">
            {candidates.length}
          </div>
          <span className="mt-1 block text-[0.72rem] text-zinc-400">In discovery inbox</span>
        </div>
      </div>

      {/* Story Ideas & Discovery Inbox */}
      <section className="rounded-2xl border border-white/[0.08] bg-[#16181D] p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.08] pb-4 gap-2">
          <div>
            <h2 className="font-sans text-lg font-semibold text-white sm:text-xl">
              Story Ideas &amp; Discovery Inbox
            </h2>
            <p className="mt-0.5 text-xs text-zinc-400">
              Verified public updates and feeds ready for editorial selection and drafting.
            </p>
          </div>
          <span className="inline-flex self-start sm:self-auto items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-[0.68rem] text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Feed Monitoring Active
          </span>
        </div>

        <div className="mt-4 divide-y divide-white/[0.06]">
          {candidates.map((cand) => (
            <div
              key={cand.id}
              className="flex flex-col justify-between gap-3.5 py-4 sm:flex-row sm:items-center transition-colors hover:bg-white/[0.02] -mx-2 px-2 rounded-xl"
            >
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="label text-[0.6rem] font-semibold text-brand-red uppercase tracking-wider">
                    {cand.category}
                  </span>
                  <span className="text-zinc-600">·</span>
                  <span className="text-zinc-400 text-[0.72rem]">{cand.source}</span>
                  <span className="text-zinc-600">·</span>
                  <span className="font-mono text-[0.68rem] text-zinc-500">{cand.freshness}</span>
                </div>
                <h3 className="text-sm font-semibold text-zinc-100 sm:text-base leading-snug">
                  {cand.title}
                </h3>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1 sm:pt-0">
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[0.65rem] font-medium text-emerald-400 border border-emerald-500/20">
                  {cand.confidence}
                </span>
                <Link
                  href={`/admin/editor?candidate=${cand.id}`}
                  className="rounded-lg bg-zinc-800 hover:bg-brand-red px-3.5 py-1.5 text-xs font-medium text-white transition-colors"
                >
                  Start Writing →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Published & Scheduled Articles */}
      <section className="rounded-2xl border border-white/[0.08] bg-[#16181D] p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div>
            <h2 className="font-sans text-lg font-semibold text-white sm:text-xl">
              Published &amp; Scheduled Stories
            </h2>
            <p className="mt-0.5 text-xs text-zinc-400">
              Active articles with formatted copy for social media and newsletter.
            </p>
          </div>
          <Link
            href="/admin/editor"
            className="text-xs font-semibold text-brand-red hover:underline"
          >
            + Write Story
          </Link>
        </div>

        {/* Desktop Table View */}
        <div className="mt-4 hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] text-zinc-400 font-medium">
                <th className="py-3">Headline</th>
                <th className="py-3">Category</th>
                <th className="py-3">Author</th>
                <th className="py-3">Status</th>
                <th className="py-3">Channels</th>
                <th className="py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {articles.map((art) => (
                <tr key={art.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 pr-4 font-medium text-zinc-100 max-w-sm truncate">
                    <Link href={`/admin/editor?slug=${art.slug}`} className="hover:text-brand-red">
                      {art.title}
                    </Link>
                  </td>
                  <td className="py-3.5 pr-4 text-zinc-400">{art.categoryName}</td>
                  <td className="py-3.5 pr-4 text-zinc-400">{typeof art.author === "string" ? art.author : art.author?.name}</td>
                  <td className="py-3.5 pr-4">
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[0.65rem] font-medium uppercase tracking-wider text-emerald-400 border border-emerald-500/20">
                      {art.status}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-1.5 font-mono text-[0.65rem] text-zinc-400">
                      {art.channelVariants?.x && <span className="rounded bg-zinc-800 px-1 py-0.5">X</span>}
                      {art.channelVariants?.facebook && <span className="rounded bg-zinc-800 px-1 py-0.5">FB</span>}
                      {art.channelVariants?.linkedin && <span className="rounded bg-zinc-800 px-1 py-0.5">LI</span>}
                      {art.channelVariants?.newsletter && <span className="rounded bg-zinc-800 px-1 py-0.5">NL</span>}
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
                      className="text-zinc-400 hover:text-white hover:underline"
                    >
                      View ↗
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile & Tablet Card View (Responsive) */}
        <div className="mt-4 md:hidden divide-y divide-white/[0.06]">
          {articles.map((art) => (
            <div key={art.id} className="py-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="label text-[0.6rem] font-semibold text-brand-red uppercase">
                  {art.categoryName}
                </span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[0.62rem] font-medium text-emerald-400 border border-emerald-500/20 uppercase">
                  {art.status}
                </span>
              </div>
              <Link
                href={`/admin/editor?slug=${art.slug}`}
                className="block text-sm font-semibold text-zinc-100 hover:text-brand-red leading-snug"
              >
                {art.title}
              </Link>
              <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
                <span>By {typeof art.author === "string" ? art.author : art.author?.name}</span>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/admin/editor?slug=${art.slug}`}
                    className="font-medium text-brand-red"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/article/${art.slug}`}
                    target="_blank"
                    className="text-zinc-400 hover:text-white"
                  >
                    View ↗
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

      </section>
    </div>
  );
}
