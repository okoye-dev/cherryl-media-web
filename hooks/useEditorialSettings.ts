import { useState, useEffect, useCallback } from "react";
import { fetchEditorialCopy, patchEditorialCopy } from "@/services/settings";
import { changedNested, isEmpty } from "@/lib/diff";
import { DEFAULT_EDITORIAL_COPY, type EditorialCopy } from "@/config/editorial-copy";

export type SettingsTab = "hero" | "ticker" | "dossier" | "footer" | "subscribers";

const FIELD_LABELS: Record<string, string> = {
  "hero.editionBadge": "Homepage badge",
  "hero.titleLead": "Headline",
  "hero.titleAccent": "Headline accent word",
  "hero.titleTrail": "Headline ending",
  "hero.description": "Homepage description",
  "ticker.label": "Ticker label",
  "ticker.customNotice": "Ticker notice",
  "dossier.issueBadge": "Culture issue badge",
  "dossier.heading": "Culture heading",
  "dossier.subheading": "Culture subheading",
  "footer.tagline": "Footer tagline",
  "footer.locations": "Footer locations",
  "footer.contactEmail": "Contact email",
  "footer.copyrightNotice": "Copyright line",
};

interface SettingsStatus {
  text: string;
  type: "success" | "error";
  problems?: string[];
}

export function useEditorialSettings() {
  const [copy, setCopy] = useState<EditorialCopy>(DEFAULT_EDITORIAL_COPY);
  const [savedCopy, setSavedCopy] = useState<EditorialCopy | null>(null);
  const [activeTab, setActiveTab] = useState<SettingsTab>("hero");
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<SettingsStatus | null>(null);

  useEffect(() => {
    let alive = true;
    fetchEditorialCopy()
      .then((data) => {
        if (!alive) return;
        setCopy(data);
        setSavedCopy(data);
      })
      .catch(() => {
        if (alive) setSavedCopy(DEFAULT_EDITORIAL_COPY);
      });
    return () => {
      alive = false;
    };
  }, []);

  const saveCopy = useCallback(async () => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      const changes = changedNested(savedCopy as unknown as Record<string, Record<string, unknown>> | null, copy as unknown as Record<string, Record<string, unknown>>);
      if (isEmpty(changes)) {
        setStatusMessage({ text: "Nothing has changed.", type: "success" });
        setTimeout(() => setStatusMessage(null), 3000);
        return;
      }
      const saved = await patchEditorialCopy(changes as Parameters<typeof patchEditorialCopy>[0]);
      setCopy(saved);
      setSavedCopy(saved);
      setStatusMessage({ text: "Saved. The site picks up the new text within a minute.", type: "success" });
      setTimeout(() => setStatusMessage(null), 6000);
    } catch (err) {
      const status = (err as { status?: number } | null)?.status;
      const data = (err as { data?: unknown } | null)?.data;
      if (status === 400) {
        const fields = (data as { fields?: Record<string, string> } | undefined)?.fields ?? {};
        const problems = Object.entries(fields).map(([path, msg]) => `${FIELD_LABELS[path] ?? path}: ${msg}`);
        setStatusMessage({ text: "Not saved. Fix these and try again.", type: "error", problems });
      } else if (status === 0) {
        setStatusMessage({ text: "Not saved. Could not reach the server. Check your connection and try again.", type: "error" });
      } else {
        const detail = err instanceof Error ? err.message : "Unknown error";
        setStatusMessage({ text: `Not saved. The server said: ${detail}`, type: "error" });
      }
    } finally {
      setIsSaving(false);
    }
  }, [copy, savedCopy]);

  const resetDefaults = useCallback(() => {
    if (confirm("Reset all site text back to the standard newsroom wording? Nothing is saved until you press Save.")) {
      setCopy(DEFAULT_EDITORIAL_COPY);
      setStatusMessage({ text: "Reset in the form. Press Save to keep it.", type: "success" });
      setTimeout(() => setStatusMessage(null), 4000);
    }
  }, []);

  return {
    copy,
    setCopy,
    savedCopy,
    activeTab,
    setActiveTab,
    isSaving,
    statusMessage,
    saveCopy,
    resetDefaults,
    setStatusMessage,
  };
}
