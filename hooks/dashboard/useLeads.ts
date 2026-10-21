import { useEffect, useState } from "react";
import { fetchCandidatesPage } from "@/services/articles";
import { toLead, type StoryLead } from "@/lib/leads";
import type { RawLead } from "@/lib/leadToArticle";

const PAGE_SIZE = 8;

export function useLeads(reload: number) {
  const [leads, setLeads] = useState<StoryLead[]>([]);
  const [page, setPage] = useState(1);
  const [info, setInfo] = useState({ total: 0, totalPages: 1, pageSize: PAGE_SIZE });
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    let alive = true;
    setBusy(true);
    fetchCandidatesPage({ page, pageSize: PAGE_SIZE })
      .then((r) => {
        if (!alive) return;
        setLeads((r.items as RawLead[]).map(toLead));
        setInfo({ total: r.total, totalPages: r.totalPages, pageSize: r.pageSize });
      })
      .catch(() => {})
      .finally(() => alive && setBusy(false));
    return () => {
      alive = false;
    };
  }, [page, reload]);

  return { leads, page, setPage, info, busy };
}
