"use client";

import { useEffect, useRef, useState } from "react";
import { Pagination, TextInput } from "@/components/admin/ui";
import { fetchArticlesPage } from "@/services/articles";
import { formatCategoryName } from "@/lib/formatters";
import type { Paged } from "@/services/api-client";
import type { CanonicalArticle } from "@/lib/types";

/**
 * Find a story by typing, then pick it. Results come from the server one page at a time
 * (8 per page), so it works the same with 25 stories or 25,000. Use it wherever a long dropdown
 * of every story would otherwise be needed.
 */
export default function StoryPicker({
  onPick,
  status = "all",
  pageSize = 8,
  placeholder = "Search stories by headline",
  excludeSlug,
}: {
  onPick: (story: CanonicalArticle) => void;
  status?: "all" | "published" | "draft";
  pageSize?: number;
  placeholder?: string;
  excludeSlug?: string;
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Paged<CanonicalArticle> | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const seq = useRef(0);

  // Typing starts again from page 1.
  useEffect(() => setPage(1), [query]);

  useEffect(() => {
    const mine = ++seq.current;
    setBusy(true);
    const t = setTimeout(
      () => {
        fetchArticlesPage({ status, q: query.trim() || undefined, page, pageSize })
          .then((r) => {
            if (mine !== seq.current) return;
            setResult(r);
            setError(null);
          })
          .catch((e) => mine === seq.current && setError(e instanceof Error ? e.message : "Could not load stories"))
          .finally(() => mine === seq.current && setBusy(false));
      },
      query ? 300 : 0
    );
    return () => clearTimeout(t);
  }, [query, page, status, pageSize]);

  const items = (result?.items ?? []).filter((s) => s.slug !== excludeSlug);

  return (
    <div className="space-y-3">
      <TextInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder={placeholder} maxLength={120} aria-label="Search stories" />
      {error && <p className="text-sm text-red-300">{error}</p>}
      <ul className={busy ? "divide-y divide-white/[0.06] opacity-60" : "divide-y divide-white/[0.06]"}>
        {items.map((s) => (
          <li key={s.id || s.slug}>
            <button
              type="button"
              onClick={() => onPick(s)}
              className="flex min-h-12 w-full items-start gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-white/[0.06]"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-[0.7rem] text-zinc-500">
                  {formatCategoryName(s.categoryName || s.category)} &middot; {s.status === "published" ? "Published" : "Draft"}
                </span>
                <span className="mt-0.5 line-clamp-2 block text-sm font-medium leading-snug text-zinc-100">{s.title}</span>
              </span>
            </button>
          </li>
        ))}
        {!busy && items.length === 0 && <li className="px-2 py-6 text-center text-sm text-zinc-500">No stories found.</li>}
      </ul>
      {result && <Pagination page={result.page} totalPages={result.totalPages} total={result.total} pageSize={result.pageSize} onPage={setPage} busy={busy} />}
    </div>
  );
}
