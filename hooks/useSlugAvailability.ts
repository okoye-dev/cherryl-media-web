import { useState, useEffect } from "react";
import { checkSlugAvailability } from "@/services/articles";

export type SlugCheckStatus = "idle" | "checking" | "available" | "unavailable";

export function useSlugAvailability(slug: string, excludeId?: string) {
  const [status, setStatus] = useState<SlugCheckStatus>("idle");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!slug || slug.trim() === "") {
      setStatus("idle");
      setMessage("");
      return;
    }

    setStatus("checking");
    const timer = setTimeout(async () => {
      try {
        const result = await checkSlugAvailability(slug, excludeId);
        if (result.available) {
          setStatus("available");
          setMessage("Slug is available");
        } else {
          setStatus("unavailable");
          setMessage("Slug already in use by another article");
        }
      } catch {
        setStatus("idle");
        setMessage("");
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [slug, excludeId]);

  return { status, message };
}
