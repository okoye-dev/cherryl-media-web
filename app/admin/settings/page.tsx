"use client";

import Link from "next/link";
import { useEditorialSettings, type SettingsTab } from "@/hooks/useEditorialSettings";
import { HeroSettingsPanel } from "@/components/admin/settings/HeroSettingsPanel";
import { TickerSettingsPanel } from "@/components/admin/settings/TickerSettingsPanel";
import { DossierSettingsPanel } from "@/components/admin/settings/DossierSettingsPanel";
import { NetworkSettingsPanel } from "@/components/admin/settings/NetworkSettingsPanel";
import { FooterSettingsPanel } from "@/components/admin/settings/FooterSettingsPanel";
import { SubscribersSettingsPanel } from "@/components/admin/settings/SubscribersSettingsPanel";

const TABS: { id: SettingsTab; label: string }[] = [
  { id: "hero", label: "1. Homepage Hero" },
  { id: "ticker", label: "2. Live Wire / Ticker" },
  { id: "dossier", label: "3. Weekend Dossier" },
  { id: "network", label: "4. Distribution Network" },
  { id: "footer", label: "5. Masthead & Footer" },
  { id: "subscribers", label: "6. Notification Emails & Subscribers" },
];

export default function AdminSettingsPage() {
  const {
    copy,
    setCopy,
    activeTab,
    setActiveTab,
    isSaving,
    statusMessage,
    saveCopy,
    resetDefaults,
  } = useEditorialSettings();

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header bar */}
      <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="label text-[0.68rem] font-semibold tracking-wider text-brand-red">
              EDITORIAL CONFIGURATION
            </span>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[0.62rem] font-medium text-emerald-400 border border-emerald-500/20">
              Live Wire Engine
            </span>
          </div>
          <h1 className="mt-1 font-sans text-2xl font-semibold text-white sm:text-3xl tracking-tight">
            Site Copy &amp; Newsroom Announcements
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Configure global homepage banners, live wire ticker notices, weekend dossier headings, and masthead credits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={resetDefaults}
            className="rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            Reset Defaults
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={saveCopy}
            className="inline-flex items-center justify-center rounded-lg bg-brand-red px-5 py-2 text-xs font-semibold text-white shadow transition-all hover:bg-brand-red/90 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`rounded-xl border p-4 text-xs font-medium ${
            statusMessage.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-red-500/30 bg-red-500/10 text-red-300"
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      {/* Navigation tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.08] pb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
              activeTab === t.id
                ? "bg-brand-red text-white shadow-sm"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Main Form Content */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#16181D] p-6 shadow-sm space-y-6">
        {activeTab === "hero" && <HeroSettingsPanel copy={copy} setCopy={setCopy} />}
        {activeTab === "ticker" && <TickerSettingsPanel copy={copy} setCopy={setCopy} />}
        {activeTab === "dossier" && <DossierSettingsPanel copy={copy} setCopy={setCopy} />}
        {activeTab === "network" && <NetworkSettingsPanel copy={copy} setCopy={setCopy} />}
        {activeTab === "footer" && <FooterSettingsPanel copy={copy} setCopy={setCopy} />}
        {activeTab === "subscribers" && <SubscribersSettingsPanel />}
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
        <Link
          href="/admin"
          className="text-xs font-medium text-zinc-400 hover:text-white transition-colors px-3 py-2"
        >
          ← Return to Stories Dashboard
        </Link>
        <button
          type="button"
          disabled={isSaving}
          onClick={saveCopy}
          className="inline-flex items-center justify-center rounded-lg bg-brand-red px-6 py-2 text-xs font-semibold text-white shadow transition-all hover:bg-brand-red/90 disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
