import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { fetchArticleBySlug, saveArticle, patchArticle } from "@/services/articles";
import { changedFields, isEmpty } from "@/lib/diff";
import { snapshotOf } from "@/lib/editor/fields";
import type { CanonicalArticle, PublishingStatus } from "@/lib/types";
import type { EditorFieldSetters } from "./useEditorFields";

const AUTOSAVE_IDLE_MS = 20000;
const TITLE_MISMATCH = "The server did not return the title you saved. Your text is still here, try saving again.";

const messageOf = (err: unknown) => (err instanceof Error && err.message ? err.message : "The server did not answer");

interface Options {
  payload: Partial<CanonicalArticle>;
  status: PublishingStatus;
  storyId: string;
  set: EditorFieldSetters;
  setSlugManual: (v: boolean) => void;
}

export function useSavePipeline({ payload: currentPayload, status, storyId, set, setSlugManual }: Options) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [savedSlug, setSavedSlugState] = useState("");
  const savedSlugRef = useRef("");
  const storedRef = useRef<Partial<CanonicalArticle> | null>(null);
  const savingRef = useRef(false);
  const rebaseNext = useRef(true);
  const [baseline, setBaseline] = useState<string | null>(null);

  const setSavedSlug = useCallback((v: string) => {
    savedSlugRef.current = v;
    setSavedSlugState(v);
  }, []);

  const resetForLoad = useCallback(
    (loadedSlug: string) => {
      rebaseNext.current = true;
      setSaveError(null);
      setSavedSlug(loadedSlug);
    },
    [setSavedSlug]
  );

  useEffect(() => {
    if (rebaseNext.current) {
      rebaseNext.current = false;
      storedRef.current = currentPayload;
      setBaseline(snapshotOf(currentPayload));
    }
  }, [currentPayload]);

  // Autosave only starts once the person has typed. Opening a story or an AI fill never writes by itself.
  const touchedRef = useRef(false);
  useEffect(() => {
    const mark = () => {
      touchedRef.current = true;
    };
    const events = ["input", "change", "keydown"] as const;
    events.forEach((e) => document.addEventListener(e, mark, true));
    return () => events.forEach((e) => document.removeEventListener(e, mark, true));
  }, []);

  const isDirty = useMemo(() => baseline !== null && snapshotOf(currentPayload) !== baseline, [baseline, currentPayload]);

  const markStored = useCallback(
    (payload: Partial<CanonicalArticle>, newId?: string) => {
      if (newId && !storyId) set.id(newId);
      if (payload.status) set.status(payload.status);
      const stored = { ...payload, id: payload.id || newId || undefined };
      storedRef.current = stored;
      setBaseline(snapshotOf(stored));
      setLastSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      setSaveError(null);
    },
    [storyId, set]
  );

  /** A new story is created in full, after that only changed fields are sent. Throws the server's message on failure. */
  const runSave = useCallback(
    async (wanted: PublishingStatus, verify: boolean): Promise<{ slug: string; sent: boolean }> => {
      if (savingRef.current) throw new Error("A save is already running.");
      savingRef.current = true;
      try {
        const payload = { ...currentPayload, status: wanted };
        const titleOk = (t?: string) => (t || "").trim() === (payload.title || "").trim();

        if (!savedSlugRef.current) {
          const firstStatus = wanted === "published" ? "draft" : wanted;
          const created = await saveArticle({ ...payload, status: firstStatus });
          const slug = created?.slug || String(payload.slug);
          if (verify) {
            const fresh = created?.title ? created : await fetchArticleBySlug(slug);
            if (!titleOk(fresh?.title)) throw new Error(TITLE_MISMATCH);
          }
          setSavedSlug(slug);
          setSlugManual(true);
          if (slug !== payload.slug) set.slug(slug);
          markStored({ ...payload, slug, status: firstStatus }, created?.id);
          return { slug, sent: true };
        }

        const changes = changedFields(storedRef.current, payload, ["publishedAt"]) as Record<string, unknown>;
        delete changes.id;
        delete changes.createdAt;
        delete changes.publishedAt;
        if (changes.status === "published") delete changes.status; // going live is the publish step
        if (isEmpty(changes)) return { slug: savedSlugRef.current, sent: false };

        const res = await patchArticle(savedSlugRef.current, changes as Partial<CanonicalArticle>);
        if (verify && res.article && !titleOk(res.article.title)) throw new Error(TITLE_MISMATCH);
        const slug = res.article?.slug || (typeof changes.slug === "string" ? changes.slug : savedSlugRef.current);
        setSavedSlug(slug);
        markStored({ ...(storedRef.current || {}), ...changes, id: storedRef.current?.id } as Partial<CanonicalArticle>);
        return { slug, sent: true };
      } finally {
        savingRef.current = false;
      }
    },
    [currentPayload, markStored, setSavedSlug, setSlugManual, set]
  );

  const title = currentPayload.title || "";
  useEffect(() => {
    if (!title.trim() || !touchedRef.current || !isDirty || status !== "draft" || isSubmitting) return;

    const timer = setTimeout(async () => {
      setAutosaveStatus("saving");
      try {
        await runSave("draft", false);
        setAutosaveStatus("saved");
      } catch (err) {
        setSaveError(messageOf(err));
        setAutosaveStatus("idle");
      }
    }, AUTOSAVE_IDLE_MS);

    return () => clearTimeout(timer);
  }, [title, status, isDirty, isSubmitting, runSave]);

  useEffect(() => {
    if (!isDirty || !touchedRef.current) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  const handleSaveDraft = useCallback(
    async (opts?: { forceDraft?: boolean }): Promise<boolean> => {
      setIsSubmitting(true);
      setSaveError(null);
      const keepLive = status === "published" && opts?.forceDraft !== true;
      try {
        await runSave(keepLive ? "published" : "draft", true);
        return true;
      } catch (err) {
        setSaveError(messageOf(err));
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [status, runSave]
  );

  const persistForPublish = useCallback(async (): Promise<string> => {
    const { slug } = await runSave(status === "published" ? "published" : "draft", false);
    return slug;
  }, [status, runSave]);

  return {
    isSubmitting,
    autosaveStatus,
    lastSavedAt,
    saveError,
    setSaveError,
    savedSlug,
    isDirty,
    markStored,
    resetForLoad,
    handleSaveDraft,
    persistForPublish,
  };
}
