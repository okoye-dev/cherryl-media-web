import React, { useState, useEffect } from "react";
import { subscriberService } from "@/services";
import type { PostSubscriber } from "@/services/contracts/ISubscriberService";
import { SITE } from "@/config/site";

export function SubscribersSettingsPanel() {
  const [subscribers, setSubscribers] = useState<PostSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadSubscribers = async () => {
    try {
      const data = await subscriberService.getSubscribers(false);
      setSubscribers(data);
    } catch (err) {
      console.error("Failed to load subscribers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscribers();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes("@")) {
      setError("Please provide a valid email address.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const cats = selectedCategory ? [selectedCategory] : [];
      await subscriberService.addSubscriber(newEmail, newName, cats);
      setNewEmail("");
      setNewName("");
      setSelectedCategory("");
      setSuccess("Subscriber email added successfully!");
      await loadSubscribers();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add subscriber");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (email: string) => {
    if (!confirm(`Remove ${email} from post publishing notifications?`)) return;
    try {
      await subscriberService.removeSubscriber(email);
      await loadSubscribers();
    } catch (err) {
      console.error("Failed to remove subscriber", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-white/[0.08] pb-3">
        <h2 className="text-base font-semibold text-white">
          Post Publishing Notification Subscribers
        </h2>
        <p className="text-xs text-zinc-400">
          Emails listed here receive instant notification dispatches in the database queue whenever a new story is published.
        </p>
      </div>

      {success && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-400">
          ✓ {success}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
          ⚠ {error}
        </div>
      )}

      {/* Add Subscriber Form */}
      <form onSubmit={handleAdd} className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
        <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
          + Add Notification Recipient Email
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[0.68rem] text-zinc-400 uppercase tracking-wider mb-1">
              Email Address *
            </label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="editor@cherrylmedia.com"
              required
              className="w-full rounded-lg border border-white/10 bg-zinc-900/80 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-brand-red focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[0.68rem] text-zinc-400 uppercase tracking-wider mb-1">
              Recipient Name
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Lead Newsroom Editor"
              className="w-full rounded-lg border border-white/10 bg-zinc-900/80 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-brand-red focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[0.68rem] text-zinc-400 uppercase tracking-wider mb-1">
              Category Pillar Filter
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-zinc-900/80 px-3 py-2 text-xs text-white focus:border-brand-red focus:outline-none"
            >
              <option value="">All Pillars (All Stories)</option>
              {SITE.categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-brand-red px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-red/90 disabled:opacity-50 transition-colors"
          >
            {saving ? "Registering..." : "+ Register Email"}
          </button>
        </div>
      </form>

      {/* Existing Subscribers Table */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
          Active Recipients ({subscribers.length})
        </h3>
        {loading ? (
          <div className="p-8 text-center text-xs text-zinc-500">Loading notification recipients...</div>
        ) : subscribers.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500 rounded-xl border border-dashed border-white/10">
            No notification subscriber emails registered yet. Add recipient emails above to receive instant dispatches on post publication.
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06] rounded-xl border border-white/10 bg-[#121317]">
            {subscribers.map((sub) => (
              <div key={sub.id} className="p-3.5 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">{sub.email}</span>
                    {sub.name && <span className="text-xs text-zinc-400">({sub.name})</span>}
                    <span className="rounded bg-emerald-500/10 px-2 py-0.5 font-mono text-[0.62rem] text-emerald-400 border border-emerald-500/20">
                      ACTIVE
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[0.68rem] text-zinc-500">
                    <span>
                      Beats:{" "}
                      {sub.categories && sub.categories.length > 0
                        ? sub.categories.join(", ")
                        : "All Editorial Pillars"}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(sub.email)}
                  className="rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
