"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getStoredToken } from "@/lib/session";
import { registerSignInHandler } from "@/lib/auth-gate";
import { Sheet } from "@/components/admin/ui";
import { SignInForm } from "@/components/admin/SignInForm";

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
      const list = waiting.current;
      waiting.current = [];
      list.forEach((resolve) => resolve(false));
    };
  }, [onLoginPage]);

  useEffect(() => {
    if (!onLoginPage && !getStoredToken()) {
      setMessage("Sign in to use the newsroom.");
      setOpen(true);
    }
  }, [onLoginPage]);

  return (
    <>
      {children}
      {!onLoginPage && (
        <Sheet open={open} onClose={() => settle(false)} width="sm" layer="z-[90]" title="Sign in" subtitle="Your work stays on this page while you sign in.">
          <div className="space-y-4">
            <SignInForm autoFocus notice={message} onSignedIn={() => settle(true)} />
            <div className="flex justify-center">
              <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-300">
                Back to site
              </Link>
            </div>
          </div>
        </Sheet>
      )}
    </>
  );
}
