"use client";

import { useState } from "react";
import { loginUser } from "@/lib/auth";
import { Btn, Label, inputClass } from "@/components/admin/ui";

interface SignInFormProps {
  onSignedIn: () => void;
  /** A line shown above the fields, for example "Your session has expired." */
  notice?: string;
  autoFocus?: boolean;
}

/** Email and password. Used by the sign-in page and by the sign-in window. */
export function SignInForm({ onSignedIn, notice, autoFocus }: SignInFormProps) {
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
      onSignedIn();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign in failed");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {notice && !error && <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">{notice}</p>}
      {error && (
        <div role="alert" className="rounded-lg border border-red-500/40 bg-red-950/30 p-3 text-sm text-red-200">
          {error}
        </div>
      )}
      <div>
        <Label htmlFor="signin-email">Email</Label>
        <input
          id="signin-email"
          type="email"
          required
          autoFocus={autoFocus}
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@cherrylmedia.com"
          className={inputClass}
        />
      </div>
      <div>
        <Label htmlFor="signin-password">Password</Label>
        <input
          id="signin-password"
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
  );
}
