"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUser } from "@/lib/auth";
import { Btn, Label, inputClass } from "@/components/admin/ui";

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
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-8">
      <div className="w-full max-w-sm space-y-5">
        <div className="space-y-2 text-center">
          <Link href="/" className="inline-flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-circle.webp" alt="Cherryl Media" width={36} height={36} className="h-9 w-9 rounded-full object-cover" />
            <span className="text-base font-semibold tracking-wide text-white">Cherryl Newsroom</span>
          </Link>
          <h1 className="text-xl font-semibold text-white">Sign in</h1>
          <p className="text-sm text-zinc-400">Manage leads, write stories and publish.</p>
        </div>

        {error && (
          <div role="alert" className="rounded-lg border border-red-500/40 bg-red-950/30 p-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-white/[0.08] bg-[#16181D] p-5">
          <div>
            <Label htmlFor="email">Email</Label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="editor@cherrylmedia.com"
              className={inputClass}
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </div>
          <Btn type="submit" variant="primary" block disabled={loading} className="w-full">
            {loading ? "Signing in..." : "Sign in"}
          </Btn>
        </form>

        <div className="flex justify-center">
          <Btn href="/" variant="ghost" size="sm" arrow="back">
            Back to site
          </Btn>
        </div>
      </div>
    </div>
  );
}
