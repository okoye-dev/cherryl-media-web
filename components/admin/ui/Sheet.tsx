"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

/**
 * The one panel every admin screen uses when something opens on top of the page
 * (picking a story, quick publish, a checklist, signing in).
 *
 * - The page behind is dimmed and blurred, so it is obvious a panel is open.
 * - On a phone it slides up from the bottom and leaves a strip of the page showing at the top,
 *   with a grab handle. It is not a new page. On larger screens it fades in as a dialog in the middle.
 * - It closes with the X, by tapping the dimmed area, with Escape, or by swiping the top down.
 * - The page behind does not scroll while it is open, and focus goes into the panel and comes back after.
 */

const CloseContext = createContext<() => void>(() => {});

/** Inside a Sheet: closes it with the slide-down animation. */
export function useSheetClose(): () => void {
  return useContext(CloseContext);
}

const EXIT_MS = 200;
const SWIPE_CLOSE_PX = 90;

interface SheetProps {
  /** Pass false to close with an animation. Parents that remove the sheet outright just skip the animation. */
  open?: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** A strip under the header that does not scroll (search boxes, notices). */
  toolbar?: React.ReactNode;
  /** A bar at the bottom that does not scroll (the main buttons). */
  footer?: React.ReactNode;
  children: React.ReactNode;
  /** "md" fits its content. "tall" always fills most of a phone screen, for long lists, so it does not jump as the list changes. */
  size?: "md" | "tall";
  /** "sm" is a narrower dialog on large screens. */
  width?: "sm" | "md" | "lg";
  /** Stacking layer. The sign-in sheet uses a higher one so it can sit over other sheets. */
  layer?: string;
  /** If false the sheet can only be closed by its own buttons. */
  dismissible?: boolean;
}

export function Sheet({
  open = true,
  onClose,
  title,
  subtitle,
  toolbar,
  footer,
  children,
  size = "md",
  width = "md",
  layer = "z-[60]",
  dismissible = true,
}: SheetProps) {
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);
  const [dragY, setDragY] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number | null>(null);
  const exiting = useRef(false);
  const titleId = useRef(`sheet-${Math.random().toString(36).slice(2, 9)}`).current;

  // Enter and leave: mount first, then flip `shown` a frame later so the transition runs.
  useEffect(() => {
    if (open) {
      exiting.current = false;
      setMounted(true);
      let b = 0;
      const a = requestAnimationFrame(() => {
        b = requestAnimationFrame(() => setShown(true));
      });
      return () => {
        cancelAnimationFrame(a);
        cancelAnimationFrame(b);
      };
    }
    setShown(false);
    const t = setTimeout(() => setMounted(false), EXIT_MS);
    return () => clearTimeout(t);
  }, [open]);

  // Close with the exit animation, then tell the parent.
  const close = useCallback(() => {
    if (exiting.current) return;
    exiting.current = true;
    setShown(false);
    setDragY(0);
    setTimeout(onClose, EXIT_MS);
  }, [onClose]);

  const requestDismiss = useCallback(() => {
    if (dismissible) close();
  }, [dismissible, close]);

  // Keep the page behind still.
  useEffect(() => {
    if (!mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mounted]);

  // Focus goes into the panel, and back to what had it when the panel closes.
  useEffect(() => {
    if (!mounted) return;
    const before = document.activeElement as HTMLElement | null;
    const t = setTimeout(() => {
      const el = panelRef.current;
      if (!el) return;
      const first = el.querySelector<HTMLElement>("[autofocus], input, textarea, select");
      (first ?? el).focus({ preventScroll: true });
    }, 60);
    return () => {
      clearTimeout(t);
      before?.focus?.({ preventScroll: true });
    };
  }, [mounted]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      requestDismiss();
      return;
    }
    if (e.key !== "Tab" || !panelRef.current) return;
    // Keep Tab inside the panel.
    const items = Array.from(
      panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'),
    ).filter((el) => el.offsetParent !== null);
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  // Swipe the top of the panel down to close (phones).
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" || !dismissible) return;
    startY.current = e.clientY;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (startY.current === null) return;
    setDragY(Math.max(0, e.clientY - startY.current));
  };
  const onPointerUp = () => {
    if (startY.current === null) return;
    startY.current = null;
    if (dragY > SWIPE_CLOSE_PX) close();
    else setDragY(0);
  };

  if (!mounted || typeof document === "undefined") return null;

  const widthCls = width === "sm" ? "sm:max-w-md" : width === "lg" ? "sm:max-w-3xl" : "sm:max-w-xl";

  return createPortal(
    <CloseContext.Provider value={close}>
      <div className={cn("fixed inset-0 flex items-end justify-center sm:items-center sm:p-6", layer)} onKeyDown={onKeyDown}>
        {/* The dimmed, blurred page behind. Tapping it closes the sheet. */}
        <div
          aria-hidden
          onClick={requestDismiss}
          className={cn(
            "absolute inset-0 bg-black/55 backdrop-blur-md transition-opacity duration-200 ease-out motion-reduce:transition-none",
            shown ? "opacity-100" : "opacity-0",
          )}
        />

        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          style={dragY ? { transform: `translateY(${dragY}px)`, transition: "none" } : undefined}
          className={cn(
            "relative flex w-full flex-col overflow-hidden border border-white/10 bg-[#16181D] shadow-2xl outline-none",
            "rounded-t-2xl sm:rounded-2xl",
            widthCls,
            size === "tall" ? "h-[88dvh] sm:h-auto sm:max-h-[85vh]" : "max-h-[88dvh] sm:max-h-[85vh]",
            "transition duration-200 ease-out motion-reduce:transition-none",
            shown ? "translate-y-0 opacity-100 sm:scale-100" : "translate-y-full opacity-100 sm:translate-y-2 sm:scale-95 sm:opacity-0",
          )}
        >
          {/* Header. On a phone this is also the swipe-down handle. */}
          <div
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            className="touch-none border-b border-white/[0.08]"
          >
            <div className="flex justify-center pt-2 sm:hidden" aria-hidden>
              <span className="h-1 w-10 rounded-full bg-white/25" />
            </div>
            <div className="flex items-start justify-between gap-3 px-4 pb-3 pt-2 sm:px-6 sm:py-4">
              <div className="min-w-0">
                <h2 id={titleId} className="text-base font-semibold tracking-tight text-white">
                  {title}
                </h2>
                {subtitle && <div className="mt-0.5 text-xs leading-relaxed text-zinc-400">{subtitle}</div>}
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="-mr-2 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
          </div>

          {toolbar && <div className="border-b border-white/[0.08] bg-[#121317] px-4 py-3 sm:px-6">{toolbar}</div>}

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6">{children}</div>

          {footer && (
            <div className="flex flex-col gap-2 border-t border-white/[0.08] bg-[#141519] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end sm:px-6 sm:py-4">
              {footer}
            </div>
          )}
        </div>
      </div>
    </CloseContext.Provider>,
    document.body,
  );
}
