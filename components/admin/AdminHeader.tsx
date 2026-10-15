"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getStoredUser, logoutUser, type AuthUser } from "@/lib/auth";

export default function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, [pathname]);

  if (pathname === "/admin/login") {
    return null;
  }

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    router.push("/admin/login");
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/[0.08] bg-[#141519]/95 px-4 sm:px-8 py-3.5 backdrop-blur-md">
      <div className="flex items-center gap-4 sm:gap-6">
        <Link href="/admin" className="flex items-center gap-2.5 text-base sm:text-lg font-medium tracking-tight text-white">
          <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full ring-1 ring-white/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo-circle.webp"
              alt="Cherryl Media"
              width={28}
              height={28}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-semibold text-white tracking-wider">CHERRYL</span>
            <span className="text-xs font-mono uppercase tracking-widest text-brand-red font-semibold">NEWSROOM</span>
          </div>
        </Link>
        <span className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-0.5 font-mono text-[0.68rem] font-medium text-zinc-400 md:inline-flex">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Editorial Desk Active
        </span>
      </div>

      <nav className="flex items-center gap-3 sm:gap-4 text-xs font-medium">
        <Link
          href="/admin"
          className={`hidden sm:inline-block transition-colors px-2 py-1 ${
            pathname === "/admin" ? "text-white font-semibold" : "text-zinc-400 hover:text-white"
          }`}
        >
          All Stories
        </Link>
        <Link
          href="/admin/sections"
          className={`hidden sm:inline-block transition-colors px-2 py-1 ${
            pathname === "/admin/sections" ? "text-white font-semibold" : "text-zinc-400 hover:text-white"
          }`}
        >
          Curated Sections
        </Link>
        <Link
          href="/admin/settings"
          className={`hidden sm:inline-block transition-colors px-2 py-1 ${
            pathname === "/admin/settings" ? "text-white font-semibold" : "text-zinc-400 hover:text-white"
          }`}
        >
          Site Copy &amp; Config
        </Link>

        <Link
          href="/admin/editor"
          className="rounded-lg bg-brand-red px-3.5 py-1.5 font-medium text-white shadow-sm transition-all hover:bg-brand-red/90"
        >
          + Write Story
        </Link>
        <Link
          href="/"
          target="_blank"
          className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
        >
          View Site ↗
        </Link>
        {user ? (
          <div className="flex items-center gap-2 border-l border-white/10 pl-3">
            <span className="hidden lg:inline text-[0.72rem] font-mono text-zinc-400 truncate max-w-[120px]">
              {user.email}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs text-zinc-400 hover:text-red-400 transition-colors"
              title="Sign out of editorial desk"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <Link
            href="/admin/login"
            className="text-xs text-zinc-400 hover:text-white transition-colors"
          >
            Sign In
          </Link>
        )}
      </nav>
    </header>
  );
}
