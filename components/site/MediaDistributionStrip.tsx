"use client";

import { useState } from "react";
import { PILL_BASE } from "./Pill";
import SocialLinks from "./SocialLinks";
import SunriseLagos from "./SunriseLagos";
import { cn } from "@/utils";

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
      <div className="overflow-hidden rounded-[2rem] bg-night text-snow">
        <div className="mx-auto max-w-3xl px-5 pb-8 pt-10 text-center sm:px-7 md:px-14 md:pt-14">
          <span className="label text-brand-red font-medium">
            DAILY NEWSLETTER
          </span>
          <h2 className="mt-3 font-area text-[clamp(1.75rem,3.2vw,2.75rem)] font-semibold leading-[1.05] tracking-[-0.025em] text-snow text-balance">
            Get the Cherryl Media <em className="font-display italic font-light text-brand-red">Morning Edition</em> in your inbox.
          </h2>
          <p className="mt-4 text-sm md:text-base font-normal leading-relaxed text-snow/75 text-balance">
            Key policy developments, practical consumer updates, and cultural essays delivered every morning at 6:00 AM.
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
                  className="w-full rounded-full border border-snow/20 bg-white/[0.08] px-5 py-3 text-sm text-snow placeholder-snow/40 focus:border-brand-red focus:outline-none focus:bg-white/[0.12]"
                />
                <button
                  type="submit"
                  className={cn(PILL_BASE, "w-full justify-center border border-snow/25 px-7 py-3 text-sm text-snow sm:w-auto")}
                >
                  Subscribe
                </button>
              </>
            )}
          </form>

          <div className="mt-7 flex items-center justify-center gap-3">
            <span className="text-[0.72rem] text-snow/50">Follow us</span>
            <SocialLinks only={["x", "facebook", "linkedin"]} />
          </div>
        </div>
        <SunriseLagos className="block h-44 w-full sm:h-56 md:h-72" />
      </div>
    </section>
  );
}
