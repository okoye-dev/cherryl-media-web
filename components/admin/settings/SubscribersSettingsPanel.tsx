import React, { useState, useEffect } from "react";
import { subscriberService } from "@/services";
import type { PostSubscriber } from "@/services/contracts/ISubscriberService";
import { SITE } from "@/config/site";
import { Btn, Panel, Label, Badge, TextInput, inputClass, Pagination } from "@/components/admin/ui";

const PAGE_SIZE = 10;

export function SubscribersSettingsPanel() {
  const [subscribers, setSubscribers] = useState<PostSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const formRef = React.useRef<HTMLFormElement>(null);
  const submitOnEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") formRef.current?.requestSubmit();
  };

  const [page, setPage] = useState(1);
  const [paging, setPaging] = useState({ total: 0, totalPages: 1 });

  const loadSubscribers = async (target = page) => {
    try {
      const data = await subscriberService.getSubscribers(false, target, PAGE_SIZE);
      // If the page we asked for is past the end (the last row was removed), step back.
      if (data.subscribers.length === 0 && data.total > 0 && target > 1) {
        setPage(target - 1);
        return loadSubscribers(target - 1);
      }
      setSubscribers(data.subscribers);
      setPaging({ total: data.total, totalPages: data.totalPages });
      setPage(data.page);
    } catch (err) {
      console.error("Failed to load subscribers", err);
      setError("Could not read the list from the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscribers(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes("@")) {
      setError("Enter a valid email address.");
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
      await loadSubscribers();
      setSuccess("Added. The list below is read back from the server.");
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: unknown) {
      setError(err instanceof Error ? `Not added. ${err.message}` : "Not added. Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (email: string) => {
    if (!confirm(`Remove ${email} from notifications?`)) return;
    setError(null);
    setSuccess(null);
    try {
      await subscriberService.removeSubscriber(email);
      await loadSubscribers();
      setSuccess(`Removed ${email}.`);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? `Not removed. ${err.message}` : "Not removed. Something went wrong.");
    }
  };

  return (
    <Panel
      title="Subscribers"
      description="These emails get a notice whenever a story is published."
    >
      <div className="space-y-5">
        {success && (
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-400">{success}</div>
        )}
        {error && <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">{error}</div>}

        <form ref={formRef} onSubmit={handleAdd} className="space-y-3 rounded-lg border border-white/10 bg-white/[0.02] p-4">
          <h3 className="text-sm font-semibold text-white">Add a recipient</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <Label htmlFor="sub-email">Email address</Label>
              <TextInput
                id="sub-email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                maxLength={120}
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value.trim())}
                onKeyDown={submitOnEnter}
                placeholder="editor@cherrylmedia.com"
              />
            </div>
            <div>
              <Label htmlFor="sub-name">Name</Label>
              <TextInput
                id="sub-name"
                maxLength={80}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={submitOnEnter}
                placeholder="Lead editor"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-1">
              <Label htmlFor="sub-cat">Category</Label>
              <select id="sub-cat" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className={inputClass}>
                <option value="">All categories</option>
                {SITE.categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex sm:justify-end">
            <Btn type="submit" variant="primary" block disabled={saving}>
              {saving ? "Adding..." : "Add recipient"}
            </Btn>
          </div>
        </form>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-white">Active recipients ({paging.total})</h3>
          {loading ? (
            <div className="p-6 text-center text-sm text-zinc-500">Loading recipients...</div>
          ) : subscribers.length === 0 ? (
            <div className="rounded-lg border border-dashed border-white/10 p-6 text-center text-sm text-zinc-500">
              No recipients yet. Add one above.
            </div>
          ) : (
            <>
              {/* Card list below lg */}
              <ul className="space-y-2 lg:hidden">
                {subscribers.map((sub) => (
                  <li key={sub.id} className="rounded-lg border border-white/10 bg-[#121317] p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="min-w-0 break-all text-sm font-medium text-white">{sub.email}</span>
                      <Badge tone="green">Active</Badge>
                    </div>
                    {sub.name && <p className="mt-0.5 text-xs text-zinc-400">{sub.name}</p>}
                    <p className="mt-1 text-xs text-zinc-500">
                      Categories: {sub.categories && sub.categories.length > 0 ? sub.categories.join(", ") : "All"}
                    </p>
                    <Btn variant="danger" block className="mt-3" onClick={() => handleRemove(sub.email)}>
                      Remove
                    </Btn>
                  </li>
                ))}
              </ul>
              {/* Table from lg */}
              <div className="hidden overflow-hidden rounded-lg border border-white/10 bg-[#121317] lg:block">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-white/10 text-xs text-zinc-500">
                    <tr>
                      <th className="px-4 py-2.5 font-medium">Email</th>
                      <th className="px-4 py-2.5 font-medium">Name</th>
                      <th className="px-4 py-2.5 font-medium">Categories</th>
                      <th className="px-4 py-2.5 font-medium">Status</th>
                      <th className="w-28 px-4 py-2.5" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {subscribers.map((sub) => (
                      <tr key={sub.id}>
                        <td className="px-4 py-2.5 font-medium text-white">{sub.email}</td>
                        <td className="px-4 py-2.5 text-zinc-400">{sub.name || "-"}</td>
                        <td className="px-4 py-2.5 text-xs text-zinc-400">
                          {sub.categories && sub.categories.length > 0 ? sub.categories.join(", ") : "All"}
                        </td>
                        <td className="px-4 py-2.5">
                          <Badge tone="green">Active</Badge>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <Btn size="sm" variant="danger" onClick={() => handleRemove(sub.email)}>
                            Remove
                          </Btn>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={page} totalPages={paging.totalPages} total={paging.total} pageSize={PAGE_SIZE} onPage={setPage} busy={loading} />
            </>
          )}
        </div>
      </div>
    </Panel>
  );
}
