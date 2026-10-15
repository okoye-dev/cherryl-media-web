"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { SITE } from "@/config/site";
import { cn } from "@/utils";

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    document.documentElement.dataset.menu = open ? "open" : "closed";
    return () => {
      delete document.documentElement.dataset.menu;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  useEffect(() => {
    close();
  }, [pathname, close]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-ink/10 bg-paper/80 px-5 py-3.5 backdrop-blur-xl md:px-10 xl:px-16">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-[1.2rem] leading-none tracking-tight text-ink cursor-pointer"
            aria-label={`${SITE.name}, home`}
          >
            <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/logo-circle.webp"
                alt="Cherryl Media Logo"
                width={32}
                height={32}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="hidden items-baseline gap-1 sm:inline-flex">
              <span className="font-sans font-normal tracking-[-0.03em]">CHERRYL</span>
              <span className="font-display text-[1.25em] font-light italic text-ink transition-colors duration-300 group-hover:text-brand-red">
                Media
              </span>
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-red" />
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-6 md:gap-8 px-4">
          <nav
            aria-label="Primary"
            className="hidden items-center gap-6 text-[0.88rem] tracking-[-0.01em] md:flex lg:gap-7"
          >
            {SITE.nav.slice(1, 6).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="py-1 text-ink transition-all duration-200 hover:italic hover:text-brand-red"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            ref={buttonRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="group relative z-50 grid h-10 w-10 place-items-center rounded-full bg-ink text-paper transition-colors duration-500 hover:bg-brand-red"
          >
            <span
              className={cn(
                "absolute flex gap-1 transition-all duration-500",
                open ? "scale-50 opacity-0" : "group-hover:gap-1.5",
              )}
            >
              <i className="h-1 w-1 rounded-full bg-current" />
              <i className="h-1 w-1 rounded-full bg-current" />
            </span>
            <span
              className={cn(
                "absolute h-4 w-4 transition-all duration-500",
                open ? "rotate-0 opacity-100" : "-rotate-90 opacity-0",
              )}
            >
              <i className="absolute left-0 top-1/2 h-px w-full rotate-45 bg-current" />
              <i className="absolute left-0 top-1/2 h-px w-full -rotate-45 bg-current" />
            </span>
          </button>
        </div>
      </header>

      <aside
        id="site-menu"
        aria-label="Editorial Index"
        className={cn(
          "fixed inset-y-0 right-0 z-30 flex w-full flex-col justify-between overflow-y-auto bg-cream px-6 pb-8 pt-24 transition-[transform,visibility] duration-[900ms] ease-[cubic-bezier(0.32,0.72,0,1)] md:w-[68vw] md:px-14 md:pb-12 xl:px-20",
          open ? "visible translate-x-0" : "invisible translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-ink/10 pb-4 shrink-0">
          <span className="label font-medium text-ink-soft">
            Editorial Categories &amp; Sections
          </span>
          <span className="font-num text-xs text-brand-red font-medium">
            Daily Edition
          </span>
        </div>

        <nav aria-label="Menu" className="my-auto flex flex-col justify-center py-6 sm:py-8">
          <ul className="flex flex-col divide-y divide-ink/10 sm:divide-y-0 sm:gap-2">
            {SITE.categories.map((cat, i) => {
              const active = pathname === `/category/${cat.slug}`;
              return (
                <li
                  key={cat.slug}
                  className="overflow-hidden"
                  style={{ transitionDelay: `${open ? 120 + i * 40 : 0}ms` }}
                >
                  <Link
                    href={`/category/${cat.slug}`}
                    onClick={close}
                    className={cn(
                      "group flex items-center justify-between gap-4 py-4 sm:py-3 transition-all duration-[900ms] ease-[cubic-bezier(0.32,0.72,0,1)]",
                      open ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
                    )}
                    style={{ transitionDelay: `${open ? 120 + i * 40 : 0}ms` }}
                  >
                    <div className="flex items-baseline gap-4 md:gap-5 min-w-0">
                      <span className="w-6 shrink-0 font-num text-xs sm:text-sm font-medium text-ink-soft md:w-8">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={cn(
                          "font-area text-[clamp(1.75rem,5.5vw,2.5rem)] font-light leading-[1.15] tracking-[-0.025em] transition-all duration-300 group-hover:italic group-hover:text-brand-red group-active:text-brand-red",
                          active ? "italic text-brand-red font-normal" : "text-ink",
                        )}
                      >
                        {cat.name}
                      </span>
                    </div>
                    <span className="hidden font-num text-xs font-medium text-ink-soft group-hover:text-brand-red sm:inline shrink-0">
                      {cat.channels ? cat.channels.join(" · ") : "Section"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex flex-col gap-6 border-t border-ink/10 pt-6 text-[0.88rem] shrink-0 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="label font-medium text-ink-soft">Cherryl Media Newsroom</p>
            <a
              href={`mailto:${SITE.email}`}
              className="mt-1 inline-block text-ink transition-colors hover:text-brand-red"
            >
              {SITE.email}
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-ink-soft">
            {SITE.socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-brand-red"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
