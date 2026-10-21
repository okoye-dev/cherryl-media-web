import { useEffect, useState } from "react";
import { fetchCandidate, type LeadCandidate } from "@/services/articles";

/** Loads one AI lead (candidate) by id. Does nothing when there is no id. */
export function useLead(id: string | null) {
  const [lead, setLead] = useState<LeadCandidate | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(id ? "loading" : "idle");

  useEffect(() => {
    if (!id) {
      setLead(null);
      setStatus("idle");
      return;
    }
    let cancelled = false;
    setStatus("loading");
    fetchCandidate(id)
      .then((data) => {
        if (cancelled) return;
        setLead(data && data.headline ? data : null);
        setStatus(data && data.headline ? "ready" : "error");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { lead, status };
}
