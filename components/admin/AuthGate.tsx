"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getStoredToken } from "@/lib/auth";
import { registerSignInHandler } from "@/lib/auth-gate";
import { Btn } from "@/components/admin/ui";
import { SignInForm } from "@/components/admin/SignInForm";

/**
 * Wraps the admin screens. Whenever the backend refuses a request because nobody is signed in,
 * this opens a sign-in window. When the person signs in, the refused request is sent again, so
 * whatever they were doing carries on. If they close the window, the request fails as usual.
 * It also opens the window straight away when the page loads with no session.
 */
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const onLoginPage = pathname === "/admin/login";
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("Sign in to continue.");
  const waiting = useRef<Array<(signedIn: boolean) => void>>([]);

  const settle = useCallback((signedIn: boolean) => {
    const list = waiting.current;
    waiting.current = [];
    setOpen(false);
    list.forEach((resolve) => resolve(signedIn));
  }, []);

  useEffect(() => {
    if (onLoginPage) return;
    registerSignInHandler((msg) => {
      setMessage(msg);
      setOpen(true);
      return new Promise<boolean>((resolve) => waiting.current.push(resolve));
    });
    return () => {
      registerSignInHandler(null);
      // Nothing is left waiting on a window that no longer exists.
      const list = waiting.current;
      waiting.current = [];
      list.forEach((resolve) => resolve(false));
    };
  }, [onLoginPage]);

  // Opening the admin with no session at all: ask straight away.
  useEffect(() => {
    if (!onLoginPage && !getStoredToken()) {
      setMessage("Sign in to use the newsroom.");
      setOpen(true);
    }
  }, [onLoginPage]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && settle(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, settle]);

  return (
    <>
      {children}
      {open && !onLoginPage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="signin-title"
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/80 p-0 backdrop-blur-sm sm:items-center sm:p-6"
        >
          <div className="w-full max-w-sm rounded-t-2xl border border-white/10 bg-[#16181D] p-5 shadow-2xl sm:rounded-2xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 id="signin-title" className="text-lg font-semibold text-white">
                  Sign in
                </h2>
                <p className="mt-0.5 text-sm text-zinc-400">Your work stays on this page while you sign in.</p>
              </div>
              <Btn variant="ghost" size="sm" onClick={() => settle(false)} className="-mr-2 shrink-0">
                Close
              </Btn>
            </div>
            <SignInForm autoFocus notice={message} onSignedIn={() => settle(true)} />
            <div className="mt-3 flex justify-center">
              <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-300">
                Back to site
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
