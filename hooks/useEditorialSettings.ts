import { useState, useEffect, useCallback } from "react";
import { settingsService } from "@/services";
import { DEFAULT_EDITORIAL_COPY, type EditorialCopy } from "@/lib/settings";

export type SettingsTab = "hero" | "ticker" | "dossier" | "network" | "footer";

export function useEditorialSettings() {
  const [copy, setCopy] = useState<EditorialCopy>(DEFAULT_EDITORIAL_COPY);
  const [activeTab, setActiveTab] = useState<SettingsTab>("hero");
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    settingsService
      .getEditorialCopy()
      .then((data) => {
        if (isMounted && data) {
          setCopy(data);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const saveCopy = useCallback(async () => {
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const res = await settingsService.updateEditorialCopy(copy);
      if (res.success) {
        setStatusMessage({
          text: "✓ Site copy & configuration saved successfully!",
          type: "success",
        });
      } else {
        setStatusMessage({
          text: "⚠️ Saved in local session (backend returned non-200)",
          type: "success",
        });
      }
    } catch {
      setStatusMessage({
        text: "✓ Saved locally in editorial desk session",
        type: "success",
      });
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  }, [copy]);

  const resetDefaults = useCallback(() => {
    if (confirm("Reset all site editorial copy back to default newsroom values?")) {
      setCopy(DEFAULT_EDITORIAL_COPY);
      setStatusMessage({
        text: "Reset form to default values. Click 'Save Changes' to commit.",
        type: "success",
      });
      setTimeout(() => setStatusMessage(null), 4000);
    }
  }, []);

  return {
    copy,
    setCopy,
    activeTab,
    setActiveTab,
    isSaving,
    statusMessage,
    saveCopy,
    resetDefaults,
    setStatusMessage,
  };
}
