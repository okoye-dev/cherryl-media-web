import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

export function useEditorRoute(savedSlug: string) {
  const searchParams = useSearchParams();
  const urlSlug = searchParams.get("slug");

  // Our own address updates after a save must not count as opening another story.
  const ownSlug = useRef<string | null>(null);
  const [ctx, setCtx] = useState({ slug: urlSlug, cand: urlSlug ? null : searchParams.get("candidate") });

  useEffect(() => {
    const s = searchParams.get("slug");
    if (s && s === ownSlug.current) return;
    setCtx((prev) => {
      const next = { slug: s, cand: s ? null : searchParams.get("candidate") };
      return prev.slug === next.slug && prev.cand === next.cand ? prev : next;
    });
  }, [searchParams]);

  useEffect(() => {
    if (!savedSlug) return;
    const wanted = `/admin/editor?slug=${encodeURIComponent(savedSlug)}`;
    ownSlug.current = savedSlug;
    if (`${window.location.pathname}${window.location.search}` !== wanted) {
      window.history.replaceState(window.history.state, "", wanted);
    }
  }, [savedSlug]);

  return { contextSlug: ctx.slug, candidateId: ctx.cand };
}
