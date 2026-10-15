"use client";

import { useState } from "react";

export default function MediaDistributionStrip() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setEmail("");
      }, 3000);
    }
  };

  return (
    <section
      id="newsletter"
      className="mx-auto mt-16 w-full max-w-[90rem] px-5 md:mt-24 md:px-10 xl:px-16"
    >
      <div className="rounded-[2rem] bg-ink p-8 text-paper md:p-14">
        <div className="mx-auto max-w-3xl text-center">
          <span className="label text-brand-red font-medium">
            DAILY NEWSLETTER
          </span>
          <h2 className="mt-3 font-area text-[clamp(1.75rem,3.2vw,2.75rem)] font-semibold leading-[1.05] tracking-[-0.025em] text-paper">
            Get the Cherryl Media <em className="font-display italic font-light text-brand-red">Morning Edition</em> in your inbox.
          </h2>
          <p className="mt-4 text-sm md:text-base font-normal leading-relaxed text-paper/75">
            Key policy developments, practical Nigerian consumer updates, and cultural essays delivered every morning at 6:00 AM.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            {subscribed ? (
              <div className="w-full rounded-full bg-emerald-500/20 border border-emerald-500/40 py-3 px-6 text-sm font-medium text-emerald-300">
                ✓ You&apos;re subscribed to the Morning Edition!
              </div>
            ) : (
              <>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full rounded-full border border-paper/20 bg-white/[0.08] px-5 py-3 text-sm text-paper placeholder-paper/40 focus:border-brand-red focus:outline-none focus:bg-white/[0.12]"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto rounded-full bg-brand-red px-7 py-3 text-sm font-semibold text-white shadow transition-all hover:bg-brand-red/90 shrink-0"
                >
                  Subscribe
                </button>
              </>
            )}
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[0.72rem] text-paper/50">
            <span>Also publishing on:</span>
            <span className="font-medium text-paper/80">Website</span>
            <span>·</span>
            <span className="font-medium text-paper/80">X</span>
            <span>·</span>
            <span className="font-medium text-paper/80">Facebook</span>
            <span>·</span>
            <span className="font-medium text-paper/80">LinkedIn</span>
          </div>
        </div>
      </div>
    </section>
  );
}
