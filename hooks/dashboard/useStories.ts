import { useEffect, useState } from "react";
import { fetchArticlesPage } from "@/services/articles";
import type { CanonicalArticle } from "@/lib/types";

export type StoryFilter = "all" | "published" | "draft";

const PAGE_SIZE = 10;

export function useStories(reload: number) {
  const [articles, setArticles] = useState<CanonicalArticle[]>([]);
  const [filter, setFilterState] = useState<StoryFilter>("all");
  const [page, setPage] = useState(1);
  const [info, setInfo] = useState({ total: 0, totalPages: 1, pageSize: PAGE_SIZE });
  const [counts, setCounts] = useState({ all: 0, published: 0, draft: 0 });
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    let alive = true;
    Promise.all(["all", "published", "draft"].map((status) => fetchArticlesPage({ status, page: 1, pageSize: 1 })))
      .then(([all, pub, dr]) => alive && setCounts({ all: all.total, published: pub.total, draft: dr.total }))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [reload]);

  useEffect(() => {
    let alive = true;
    setBusy(true);
    fetchArticlesPage({ status: filter, page, pageSize: PAGE_SIZE })
      .then((r) => {
        if (!alive) return;
        setArticles(r.items);
        setInfo({ total: r.total, totalPages: r.totalPages, pageSize: r.pageSize });
      })
      .catch(() => {})
      .finally(() => alive && setBusy(false));
    return () => {
      alive = false;
    };
  }, [filter, page, reload]);

  const setFilter = (f: StoryFilter) => {
    setFilterState(f);
    setPage(1);
  };

  return { articles, filter, setFilter, page, setPage, info, counts, busy };
}
