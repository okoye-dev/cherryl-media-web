import { useState, useCallback } from "react";
import { publishArticle } from "@/services/articles";
import type { CanonicalArticle } from "@/lib/types";

export type PublishStep = "media" | "editorial" | "engine" | "done";
export type StepState = "pending" | "running" | "success" | "error";

export function usePublishPipeline() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<PublishStep>("media");
  const [stepStates, setStepStates] = useState<{
    media: StepState;
    editorial: StepState;
    engine: StepState;
  }>({
    media: "pending",
    editorial: "pending",
    engine: "pending",
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [publishedSlug, setPublishedSlug] = useState<string>("");

  const startPublish = useCallback(
    async (
      payload: Partial<CanonicalArticle>,
      options: {
        inFlightUploads: number;
        coverUrl: string;
        /** Stores any unsaved changes (only what changed) and returns the story's address */
        persist: () => Promise<string>;
        /** The story is already live: save the changes and keep it live, no publish call */
        alreadyLive?: boolean;
      }
    ) => {
      const articleSlug = payload.slug || (payload.title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
      setPublishedSlug(articleSlug);
      setIsOpen(true);
      setErrorMessage(null);
      setStep("media");
      setStepStates({
        media: "running",
        editorial: "pending",
        engine: "pending",
      });

      // Step 1: Media check
      if (options.inFlightUploads > 0) {
        setErrorMessage(`Waiting for ${options.inFlightUploads} media asset(s) to finish upload...`);
        let attempts = 0;
        while (attempts < 20 && options.inFlightUploads > 0) {
          await new Promise((r) => setTimeout(r, 600));
          attempts++;
        }
      }

      if (!options.coverUrl || !options.coverUrl.trim()) {
        setStepStates((prev) => ({ ...prev, media: "error" }));
        setErrorMessage("A cover photo is required before publishing. Please upload a story photo.");
        return false;
      }

      setStepStates((prev) => ({ ...prev, media: "success", editorial: "running" }));
      setStep("editorial");

      await new Promise((r) => setTimeout(r, 350));

      // Step 2: Editorial integrity
      if (!payload.title || !payload.title.trim()) {
        setStepStates((prev) => ({ ...prev, editorial: "error" }));
        setErrorMessage("Post title cannot be empty.");
        return false;
      }

      setStepStates((prev) => ({ ...prev, editorial: "success", engine: "running" }));
      setStep("engine");

      // Step 3: Engine sync
      try {
        const savedAt = await options.persist();
        setPublishedSlug(savedAt);
        if (!options.alreadyLive) await publishArticle(savedAt);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to publish article";
        console.error("Backend engine publish error:", msg);
        setStepStates((prev) => ({ ...prev, engine: "error" }));
        setErrorMessage(msg);
        return false;
      }

      setStepStates((prev) => ({ ...prev, engine: "success" }));
      setStep("done");
      return true;
    },
    []
  );

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    step,
    stepStates,
    errorMessage,
    publishedSlug,
    startPublish,
    close,
  };
}
