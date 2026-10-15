"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUser } from "@/lib/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await loginUser(email, password);
      router.push("/admin");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex flex-col items-center gap-2 group">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-brand-red/30 transition-transform duration-300 group-hover:scale-105">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/logo-circle.webp"
                alt="Cherryl Media"
                width={48}
                height={48}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-2xl tracking-wider text-white">CHERRYL</span>
              <span className="font-mono text-xs uppercase tracking-widest text-brand-red font-semibold">
                NEWSROOM
              </span>
            </div>
          </Link>
          <h1 className="text-lg font-semibold text-zinc-100">Editorial Desk Login</h1>
          <p className="text-xs text-zinc-400">
            Sign in to manage news intake, write stories, and publish to web &amp; social channels.
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-950/30 p-3.5 text-xs text-red-200">
            {error}
          </div>
        )}

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/[0.08] bg-[#16181D] p-6 shadow-xl space-y-4"
        >
          <div>
            <label className="block text-[0.72rem] font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
              Newsroom Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="editor@cherrylmedia.com"
              className="h-11 w-full rounded-xl border border-white/10 bg-[#1A1D24] px-3.5 text-sm font-medium text-white placeholder-zinc-500 focus:border-brand-red focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-[0.72rem] font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="h-11 w-full rounded-xl border border-white/10 bg-[#1A1D24] px-3.5 text-sm font-medium text-white placeholder-zinc-500 focus:border-brand-red focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-brand-red text-sm font-semibold text-white shadow hover:bg-brand-red/90 transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? "Authenticating..." : "Sign In to Editorial Desk"}
          </button>
        </form>

        <div className="text-center">
          <Link
            href="/"
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            ← Return to public publication
          </Link>
        </div>
      </div>
    </div>
  );
}
