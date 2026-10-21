"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SESSION_EVENT, getStoredUser, type AuthUser } from "@/lib/session";
import { logoutUser } from "@/services/auth";
import { Btn } from "@/components/admin/ui";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/admin", label: "Stories" },
  { href: "/admin/sections", label: "Homepage sections" },
  { href: "/admin/settings", label: "Site copy" },
];

export default function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const read = () => setUser(getStoredUser());
    read();
    window.addEventListener(SESSION_EVENT, read);
    return () => window.removeEventListener(SESSION_EVENT, read);
  }, [pathname]);

  if (pathname === "/admin/login") return null;

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    router.push("/admin/login");
  };

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const navLinks = NAV.map((item) => (
    <Link
      key={item.href}
      href={item.href}
      className={cn(
        "inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-lg px-3 text-[0.8rem] font-medium transition-colors",
        isActive(item.href) ? "bg-white/[0.1] text-white" : "text-zinc-400 hover:bg-white/[0.05] hover:text-white",
      )}
    >
      {item.label}
    </Link>
  ));

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#141519]/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-[96rem] items-center justify-between gap-3 px-4 sm:px-6 md:px-10">
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/admin" className="flex shrink-0 items-center gap-2.5" aria-label="Cherryl Newsroom home">
            <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/logo-circle.webp" alt="" width={28} height={28} className="h-full w-full object-cover" />
            </span>
            <span className="flex items-baseline gap-1.5 whitespace-nowrap">
              <span className="text-sm font-semibold tracking-wider text-white">CHERRYL</span>
              <span className="text-[0.62rem] font-semibold tracking-[0.18em] text-brand-red">NEWSROOM</span>
            </span>
          </Link>

          {/* Navigation sits here from md up; on phones it moves to its own row below */}
          <nav aria-label="Admin" className="ml-2 hidden items-center gap-1 md:flex">
            {navLinks}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Btn href="/admin/editor" variant="primary" size="sm" className="!h-9">
            <span className="sm:hidden">Write</span>
            <span className="hidden sm:inline">Write story</span>
          </Btn>
          <Btn href="/" target="_blank" size="sm" arrow="forward" className="hidden !h-9 sm:inline-flex">
            View site
          </Btn>
          {user ? (
            <div className="flex items-center gap-2 sm:border-l sm:border-white/10 sm:pl-3">
              <span className="hidden max-w-[10rem] truncate text-[0.72rem] text-zinc-400 xl:inline">{user.email}</span>
              <Btn variant="ghost" size="sm" onClick={handleLogout} className="!h-9" title="Sign out">
                Sign out
              </Btn>
            </div>
          ) : (
            <Btn href="/admin/login" variant="ghost" size="sm" className="!h-9">
              Sign in
            </Btn>
          )}
        </div>
      </div>

      {/* Phone and small tablet navigation: one scrolling row, never wraps */}
      <nav
        aria-label="Admin"
        className="flex gap-1 overflow-x-auto border-t border-white/[0.06] px-4 py-1.5 [scrollbar-width:none] sm:px-6 md:hidden [&::-webkit-scrollbar]:hidden"
      >
        {navLinks}
        <Link
          href="/"
          target="_blank"
          className="inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-lg px-3 text-[0.8rem] font-medium text-zinc-400 hover:text-white sm:hidden"
        >
          View site
        </Link>
      </nav>
    </header>
  );
}
