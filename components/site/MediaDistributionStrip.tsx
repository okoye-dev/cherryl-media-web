"use client";

import { useState } from "react";
import { addSubscriber } from "@/services/subscribers";
import { PILL_BASE } from "./Pill";
import SocialLinks from "./SocialLinks";
import { cn } from "@/lib/cn";
import { SunriseLagos, EditionStamp, Cherries, Sparkle, CowrieRing } from "@/components/art";

type FormState = "idle" | "saving" | "done" | "error";

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function MediaDistributionStrip() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");
  // A box people never see. Bots fill it in; a real person leaves it empty.
  const [trap, setTrap] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "saving") return;
    const clean = email.trim().toLowerCase();
    if (!EMAIL_SHAPE.test(clean)) {
      setState("error");
      setMessage("Enter a valid email address, like name@example.com.");
      return;
    }
    if (trap) {
      // Pretend it worked, and save nothing.
      setState("done");
      return;
    }
    setState("saving");
    setMessage("");
    try {
      await addSubscriber(clean);
      setState("done");
      setEmail("");
    } catch (err) {
      setState("error");
      const text = err instanceof Error ? err.message : "";
      setMessage(
        /valid email/i.test(text)
          ? "That email address does not look right. Check it and try again."
          : "We could not save your email just now. Please try again in a moment.",
      );
    }
  };

  return (
    <section
      id="newsletter"
      className="mx-auto mt-16 w-full max-w-[90rem] px-5 md:mt-24 md:px-10 xl:px-16"
    >
      <div className="relative overflow-hidden rounded-[2rem] bg-night text-snow">
        {/* The sunrise sits behind everything, fading out towards the top */}
        <SunriseLagos
          className="pointer-events-none absolute inset-x-0 -bottom-5 block h-52 w-full sm:-bottom-9 sm:aspect-[1200/400] sm:h-auto md:-bottom-14"
          fade
        />

        {/* Scattered artwork. Decorative, and kept clear of the text column. */}
        <EditionStamp className="pointer-events-none absolute left-6 top-6 hidden h-28 w-28 -rotate-12 text-snow/70 lg:block xl:left-14 xl:top-10 xl:h-32 xl:w-32" />
        <Cherries className="pointer-events-none absolute right-5 top-5 h-14 w-14 rotate-12 sm:right-8 sm:top-8 sm:h-16 sm:w-16 lg:right-14 lg:top-12 lg:h-24 lg:w-24" />
        <Sparkle className="pointer-events-none absolute left-[14%] top-[44%] hidden h-5 w-5 text-brand-red/80 md:block" />
        <Sparkle className="pointer-events-none absolute left-[7%] top-[32%] hidden h-3.5 w-3.5 text-orange/80 md:block" />
        <CowrieRing className="pointer-events-none absolute -left-8 top-[52%] hidden h-24 w-24 opacity-60 lg:block" />
        <CowrieRing className="pointer-events-none absolute -right-10 top-[36%] hidden h-28 w-28 opacity-40 lg:block" />

        <div className="relative mx-auto flex max-w-2xl flex-col items-center px-5 pb-28 pt-10 text-center sm:px-7 sm:pb-32 md:pt-12">
          {/* 1. What it is */}
          <span className="inline-flex items-center gap-2 rounded-full border border-snow/20 px-3.5 py-1.5 text-[0.68rem] font-medium uppercase tracking-[0.14em] text-snow/80">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-red" />
            Daily newsletter
          </span>

          {/* 2. The promise */}
          <h2 className="mt-4 font-area text-[clamp(1.7rem,3.6vw,2.6rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-snow text-balance">
            The <em className="font-display font-light italic text-brand-red">Morning Edition</em>, before your day begins.
          </h2>

          {/* 3. One line of detail */}
          <p className="mt-3 max-w-md text-[0.92rem] leading-relaxed text-snow/70 text-balance">
            Policy, money and culture from across Nigeria, in one email.
          </p>

          {/* 4. The action */}
          <form onSubmit={handleSubmit} noValidate className="mt-5 w-full max-w-md">
            {state === "done" ? (
              <div role="status" className="rounded-full border border-emerald-400/40 bg-emerald-400/15 px-6 py-3.5 text-sm font-medium text-emerald-200">
                You&apos;re on the list for the Morning Edition
              </div>
            ) : (
              <>
                <div
                  className={cn(
                    "flex items-center rounded-full border bg-snow/[0.08] p-1.5 backdrop-blur-md focus-within:border-brand-red/70",
                    state === "error" ? "border-red-400/60" : "border-snow/25",
                  )}
                >
                  <input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    maxLength={120}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (state === "error") setState("idle");
                    }}
                    placeholder="Your email address"
                    aria-label="Email address"
                    aria-invalid={state === "error"}
                    aria-describedby={state === "error" ? "newsletter-error" : undefined}
                    className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-sm text-snow placeholder-snow/45 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={state === "saving"}
                    className={cn(PILL_BASE, "bg-brand-red/25 px-5 py-2.5 text-sm text-snow disabled:opacity-60")}
                  >
                    {state === "saving" ? "Saving..." : "Subscribe"}
                  </button>
                </div>
                {/* Hidden from people and from screen readers */}
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  value={trap}
                  onChange={(e) => setTrap(e.target.value)}
                  className="absolute -left-[9999px] h-0 w-0 opacity-0"
                />
                {state === "error" && (
                  <p id="newsletter-error" role="alert" className="mt-2 rounded-full bg-night/60 px-4 py-1.5 text-center text-xs text-red-200 backdrop-blur-md">
                    {message}
                  </p>
                )}
              </>
            )}
          </form>

          {/* 5. Elsewhere */}
          <div className="mt-5 flex items-center justify-center gap-3 rounded-full border border-snow/10 bg-snow/[0.06] py-1.5 pl-5 pr-2 backdrop-blur-md">
            <span className="text-[0.74rem] text-snow/75">Follow us</span>
            <SocialLinks only={["x", "facebook", "linkedin"]} />
          </div>
        </div>

      </div>
    </section>
  );
}
