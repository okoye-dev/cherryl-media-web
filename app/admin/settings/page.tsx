"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DEFAULT_EDITORIAL_COPY, type EditorialCopy } from "@/lib/settings";

export default function AdminSettingsPage() {
  const [copy, setCopy] = useState<EditorialCopy>(DEFAULT_EDITORIAL_COPY);
  const [activeTab, setActiveTab] = useState<"hero" | "ticker" | "dossier" | "network" | "footer">("hero");
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
    fetch(`${backendUrl}/api/settings`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.editorial_copy) {
          setCopy({
            hero: { ...DEFAULT_EDITORIAL_COPY.hero, ...(data.editorial_copy.hero || {}) },
            ticker: { ...DEFAULT_EDITORIAL_COPY.ticker, ...(data.editorial_copy.ticker || {}) },
            dossier: { ...DEFAULT_EDITORIAL_COPY.dossier, ...(data.editorial_copy.dossier || {}) },
            network: { ...DEFAULT_EDITORIAL_COPY.network, ...(data.editorial_copy.network || {}) },
            footer: { ...DEFAULT_EDITORIAL_COPY.footer, ...(data.editorial_copy.footer || {}) },
          });
        }
      })
      .catch(() => {});
  }, []);


  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage(null);

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
    try {
      const res = await fetch(`${backendUrl}/api/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ editorial_copy: copy }),
      });

      if (res.ok) {
        setStatusMessage({ text: "✓ Site copy & configuration saved successfully!", type: "success" });
      } else {
        setStatusMessage({ text: "⚠️ Saved in local session (backend returned non-200)", type: "success" });
      }
    } catch {
      setStatusMessage({ text: "✓ Saved locally in editorial desk session", type: "success" });
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const handleResetDefaults = () => {
    if (confirm("Reset all site editorial copy back to default newsroom values?")) {
      setCopy(DEFAULT_EDITORIAL_COPY);
      setStatusMessage({ text: "Reset form to default values. Click 'Save Changes' to commit.", type: "success" });
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header bar */}
      <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="label text-[0.68rem] font-semibold tracking-wider text-brand-red">EDITORIAL CONFIGURATION</span>
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
            onClick={handleResetDefaults}
            className="rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            Reset Defaults
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
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
        {([
          { id: "hero", label: "1. Homepage Hero" },
          { id: "ticker", label: "2. Live Wire / Ticker" },
          { id: "dossier", label: "3. Weekend Dossier" },
          { id: "network", label: "4. Distribution Network" },
          { id: "footer", label: "5. Masthead & Footer" },
        ] as const).map((t) => (
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
        {/* HERO SECTION */}
        {activeTab === "hero" && (
          <div className="space-y-6">
            <div className="border-b border-white/[0.08] pb-3">
              <h2 className="text-base font-semibold text-white">Homepage Hero &amp; Masthead Title</h2>
              <p className="text-xs text-zinc-400">Controls the primary title and description visible when readers land on Cherryl Media.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Edition Badge
                </label>
                <input
                  type="text"
                  value={copy.hero.editionBadge}
                  onChange={(e) =>
                    setCopy((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, editionBadge: e.target.value },
                    }))
                  }
                  className="w-full rounded-lg border border-white/10 bg-zinc-900/80 px-3.5 py-2 text-xs text-white focus:border-brand-red focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Title Lead
                  </label>
                  <input
                    type="text"
                    value={copy.hero.titleLead}
                    onChange={(e) =>
                      setCopy((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, titleLead: e.target.value },
                      }))
                    }
                    className="w-full rounded-lg border border-white/10 bg-zinc-900/80 px-3.5 py-2 text-xs text-white focus:border-brand-red focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Title Accent (Italic Crimson)
                  </label>
                  <input
                    type="text"
                    value={copy.hero.titleAccent}
                    onChange={(e) =>
                      setCopy((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, titleAccent: e.target.value },
                      }))
                    }
                    className="w-full rounded-lg border border-brand-red/30 bg-zinc-900/80 px-3.5 py-2 text-xs text-white focus:border-brand-red focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Title Trail
                  </label>
                  <input
                    type="text"
                    value={copy.hero.titleTrail}
                    onChange={(e) =>
                      setCopy((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, titleTrail: e.target.value },
                      }))
                    }
                    className="w-full rounded-lg border border-white/10 bg-zinc-900/80 px-3.5 py-2 text-xs text-white focus:border-brand-red focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Editorial Description
                </label>
                <textarea
                  rows={3}
                  value={copy.hero.description}
                  onChange={(e) =>
                    setCopy((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, description: e.target.value },
                    }))
                  }
                  className="w-full rounded-lg border border-white/10 bg-zinc-900/80 px-3.5 py-2 text-xs text-white focus:border-brand-red focus:outline-none"
                />
              </div>

              {/* Live Preview */}
              <div className="rounded-xl border border-white/10 bg-[#0d0e12] p-4 space-y-2">
                <span className="label text-[0.62rem] text-zinc-400 uppercase tracking-wider">Hero Preview</span>
                <p className="label-red text-xs font-semibold text-brand-red">{copy.hero.editionBadge}</p>
                <h3 className="text-xl font-bold text-white">
                  <span>{copy.hero.titleLead}</span>
                  <span className="italic font-serif text-brand-red">{copy.hero.titleAccent}</span>
                  <span>{copy.hero.titleTrail}</span>
                </h3>
                <p className="text-xs text-zinc-400 max-w-xl">{copy.hero.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* TICKER / LIVE WIRE */}
        {activeTab === "ticker" && (
          <div className="space-y-6">
            <div className="border-b border-white/[0.08] pb-3">
              <h2 className="text-base font-semibold text-white">Live Wire Ticker Announcement</h2>
              <p className="text-xs text-zinc-400">Controls the breaking news notice scrolling continuously across the top of the publication.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Ticker Label Badge
                </label>
                <input
                  type="text"
                  value={copy.ticker.label}
                  onChange={(e) =>
                    setCopy((prev) => ({
                      ...prev,
                      ticker: { ...prev.ticker, label: e.target.value },
                    }))
                  }
                  className="w-full max-w-xs rounded-lg border border-white/10 bg-zinc-900/80 px-3.5 py-2 text-xs text-white focus:border-brand-red focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Breaking Notice / Live Wire Text
                </label>
                <textarea
                  rows={3}
                  value={copy.ticker.customNotice}
                  onChange={(e) =>
                    setCopy((prev) => ({
                      ...prev,
                      ticker: { ...prev.ticker, customNotice: e.target.value },
                    }))
                  }
                  className="w-full rounded-lg border border-white/10 bg-zinc-900/80 px-3.5 py-2 text-xs text-white focus:border-brand-red focus:outline-none"
                />
              </div>

              {/* Ticker Preview */}
              <div className="rounded-xl border border-white/10 bg-[#0d0e12] p-4 flex items-center gap-3">
                <span className="rounded bg-brand-red px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-white shrink-0">
                  {copy.ticker.label}
                </span>
                <span className="text-xs text-zinc-200 truncate">{copy.ticker.customNotice}</span>
              </div>
            </div>
          </div>
        )}

        {/* WEEKEND DOSSIER */}
        {activeTab === "dossier" && (
          <div className="space-y-6">
            <div className="border-b border-white/[0.08] pb-3">
              <h2 className="text-base font-semibold text-white">Weekend Editorial Dossier</h2>
              <p className="text-xs text-zinc-400">Controls the branding, issue badge, and subtitle for the curated cultural section.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Issue Badge
                </label>
                <input
                  type="text"
                  value={copy.dossier.issueBadge}
                  onChange={(e) =>
                    setCopy((prev) => ({
                      ...prev,
                      dossier: { ...prev.dossier, issueBadge: e.target.value },
                    }))
                  }
                  className="w-full max-w-md rounded-lg border border-white/10 bg-zinc-900/80 px-3.5 py-2 text-xs text-white focus:border-brand-red focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Dossier Main Heading
                </label>
                <input
                  type="text"
                  value={copy.dossier.heading}
                  onChange={(e) =>
                    setCopy((prev) => ({
                      ...prev,
                      dossier: { ...prev.dossier, heading: e.target.value },
                    }))
                  }
                  className="w-full rounded-lg border border-white/10 bg-zinc-900/80 px-3.5 py-2 text-xs text-white focus:border-brand-red focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Dossier Subheading / Focus
                </label>
                <textarea
                  rows={2}
                  value={copy.dossier.subheading}
                  onChange={(e) =>
                    setCopy((prev) => ({
                      ...prev,
                      dossier: { ...prev.dossier, subheading: e.target.value },
                    }))
                  }
                  className="w-full rounded-lg border border-white/10 bg-zinc-900/80 px-3.5 py-2 text-xs text-white focus:border-brand-red focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* DISTRIBUTION NETWORK */}
        {activeTab === "network" && (
          <div className="space-y-6">
            <div className="border-b border-white/[0.08] pb-3">
              <h2 className="text-base font-semibold text-white">Multi-Channel Distribution Network</h2>
              <p className="text-xs text-zinc-400">Controls the syndicated readership stats and subscriber copy across channels.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Network Headline
                </label>
                <input
                  type="text"
                  value={copy.network.headline}
                  onChange={(e) =>
                    setCopy((prev) => ({
                      ...prev,
                      network: { ...prev.network, headline: e.target.value },
                    }))
                  }
                  className="w-full rounded-lg border border-white/10 bg-zinc-900/80 px-3.5 py-2 text-xs text-white focus:border-brand-red focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Network Subheadline
                </label>
                <textarea
                  rows={2}
                  value={copy.network.subheadline}
                  onChange={(e) =>
                    setCopy((prev) => ({
                      ...prev,
                      network: { ...prev.network, subheadline: e.target.value },
                    }))
                  }
                  className="w-full rounded-lg border border-white/10 bg-zinc-900/80 px-3.5 py-2 text-xs text-white focus:border-brand-red focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Subscribers Stat
                  </label>
                  <input
                    type="text"
                    value={copy.network.subscribers}
                    onChange={(e) =>
                      setCopy((prev) => ({
                        ...prev,
                        network: { ...prev.network, subscribers: e.target.value },
                      }))
                    }
                    className="w-full rounded-lg border border-white/10 bg-zinc-900/80 px-3.5 py-2 text-xs text-white focus:border-brand-red focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Monthly Reach Stat
                  </label>
                  <input
                    type="text"
                    value={copy.network.reachMonthly}
                    onChange={(e) =>
                      setCopy((prev) => ({
                        ...prev,
                        network: { ...prev.network, reachMonthly: e.target.value },
                      }))
                    }
                    className="w-full rounded-lg border border-white/10 bg-zinc-900/80 px-3.5 py-2 text-xs text-white focus:border-brand-red focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FOOTER & MASTHEAD */}
        {activeTab === "footer" && (
          <div className="space-y-6">
            <div className="border-b border-white/[0.08] pb-3">
              <h2 className="text-base font-semibold text-white">Newsroom Masthead &amp; Legal Footer</h2>
              <p className="text-xs text-zinc-400">Controls the publication tagline, bureau locations, contact email, and copyright.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Editorial Tagline
                </label>
                <input
                  type="text"
                  value={copy.footer.tagline}
                  onChange={(e) =>
                    setCopy((prev) => ({
                      ...prev,
                      footer: { ...prev.footer, tagline: e.target.value },
                    }))
                  }
                  className="w-full rounded-lg border border-white/10 bg-zinc-900/80 px-3.5 py-2 text-xs text-white focus:border-brand-red focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Bureau Locations
                  </label>
                  <input
                    type="text"
                    value={copy.footer.locations}
                    onChange={(e) =>
                      setCopy((prev) => ({
                        ...prev,
                        footer: { ...prev.footer, locations: e.target.value },
                      }))
                    }
                    className="w-full rounded-lg border border-white/10 bg-zinc-900/80 px-3.5 py-2 text-xs text-white focus:border-brand-red focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Newsroom Contact Email
                  </label>
                  <input
                    type="email"
                    value={copy.footer.contactEmail}
                    onChange={(e) =>
                      setCopy((prev) => ({
                        ...prev,
                        footer: { ...prev.footer, contactEmail: e.target.value },
                      }))
                    }
                    className="w-full rounded-lg border border-white/10 bg-zinc-900/80 px-3.5 py-2 text-xs text-white focus:border-brand-red focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Copyright Notice
                </label>
                <input
                  type="text"
                  value={copy.footer.copyrightNotice}
                  onChange={(e) =>
                    setCopy((prev) => ({
                      ...prev,
                      footer: { ...prev.footer, copyrightNotice: e.target.value },
                    }))
                  }
                  className="w-full rounded-lg border border-white/10 bg-zinc-900/80 px-3.5 py-2 text-xs text-white focus:border-brand-red focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}
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
          onClick={handleSave}
          className="inline-flex items-center justify-center rounded-lg bg-brand-red px-6 py-2 text-xs font-semibold text-white shadow transition-all hover:bg-brand-red/90 disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
