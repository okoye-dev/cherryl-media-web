"use client";

import { useEffect } from "react";
import { useEditorialSettings, type SettingsTab } from "@/hooks/useEditorialSettings";
import { Btn, PageTitle, Tabs } from "@/components/admin/ui";
import { HeroSettingsPanel } from "@/components/admin/settings/HeroSettingsPanel";
import { TickerSettingsPanel } from "@/components/admin/settings/TickerSettingsPanel";
import { DossierSettingsPanel } from "@/components/admin/settings/DossierSettingsPanel";
import { FooterSettingsPanel } from "@/components/admin/settings/FooterSettingsPanel";
import { SubscribersSettingsPanel } from "@/components/admin/settings/SubscribersSettingsPanel";

const TABS: { id: SettingsTab; label: string }[] = [
  { id: "hero", label: "Homepage top" },
  { id: "ticker", label: "News ticker" },
  { id: "dossier", label: "Culture section" },
  { id: "footer", label: "Footer" },
  { id: "subscribers", label: "Subscribers" },
];

export default function AdminSettingsPage() {
  const { copy, setCopy, savedCopy, activeTab, setActiveTab, isSaving, statusMessage, saveCopy, resetDefaults } =
    useEditorialSettings();

  // Changed means: different from what the backend last stored.
  const current = JSON.stringify(copy);
  const baseline = savedCopy ? JSON.stringify(savedCopy) : null;
  const dirty = baseline !== null && baseline !== current;
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const showBar = activeTab !== "subscribers";

  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-28">
      <div>
        <PageTitle eyebrow="Settings" title="Site copy" />
        <p className="mt-1.5 text-sm text-zinc-400">The words readers see on the homepage, ticker and footer.</p>
      </div>

      {statusMessage && (
        <div
          className={`rounded-lg border p-3 text-sm ${
            statusMessage.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-red-500/30 bg-red-500/10 text-red-300"
          }`}
        >
          <p>{statusMessage.text}</p>
          {statusMessage.problems && statusMessage.problems.length > 0 && (
            <ul className="mt-1.5 list-disc space-y-0.5 pl-5">
              {statusMessage.problems.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <Tabs value={activeTab} onChange={setActiveTab} items={TABS} className="border-b border-white/[0.08] pb-2" />

      <div>
        {activeTab === "hero" && <HeroSettingsPanel copy={copy} setCopy={setCopy} />}
        {activeTab === "ticker" && <TickerSettingsPanel copy={copy} setCopy={setCopy} />}
        {activeTab === "dossier" && <DossierSettingsPanel copy={copy} setCopy={setCopy} />}
        {activeTab === "footer" && <FooterSettingsPanel copy={copy} setCopy={setCopy} />}
        {activeTab === "subscribers" && <SubscribersSettingsPanel />}
      </div>

      {showBar && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#0E0F12]/95 backdrop-blur">
          <div className="mx-auto flex max-w-[96rem] items-center gap-3 px-4 py-3 sm:px-6 md:px-10">
            <p className="hidden min-w-0 flex-1 truncate text-xs text-zinc-400 sm:block">
              {dirty ? <span className="text-amber-300">Unsaved changes</span> : "All changes saved"}
            </p>
            <Btn onClick={resetDefaults} className="shrink-0">
              Reset
            </Btn>
            <Btn variant="primary" disabled={isSaving || !dirty} onClick={saveCopy} className="flex-1 sm:flex-none sm:min-w-32">
              {isSaving ? "Saving..." : dirty ? "Save changes" : "Saved"}
            </Btn>
          </div>
          {dirty && <p className="px-4 pb-2 text-center text-xs text-amber-300 sm:hidden">Unsaved changes</p>}
        </div>
      )}
    </div>
  );
}
