import Link from "next/link";
import { SITE } from "@/config/site";
import Pill from "./Pill";

export default function SiteFooter() {
  return (
    <footer
      id="contact"
      className="mx-auto w-full max-w-[90rem] px-5 pb-6 pt-16 md:px-10 md:pb-10 md:pt-28 xl:px-16"
    >
      <div className="rounded-[1.75rem] bg-ink px-6 py-8 text-paper md:rounded-[2rem] md:p-12">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
          <div className="max-w-xl">
            <p className="label text-brand-red font-medium">DISPATCHES &amp; SYNDICATION</p>
            <h2 className="mt-3 font-display text-[clamp(1.8rem,4vw,3.4rem)] font-light leading-[0.98] tracking-[-0.03em] text-paper">
              Reporting the stories <em className="italic text-brand-red">shaping contemporary Africa.</em>
            </h2>
            <p className="mt-4 text-sm font-light leading-relaxed text-paper/70">
              Direct intelligence from sub-national corridors, enterprise hubs, and cultural frontiers.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <span className="label text-paper/50">NEWSROOM CONTACT</span>
            <Pill href={`mailto:${SITE.email}`} variant="paper">
              {SITE.email}
            </Pill>
            <div className="flex flex-wrap gap-2">
              {SITE.socials.map((s) => (
                <Pill key={s.label} href={s.href} variant="line">
                  {s.label}
                </Pill>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-8 border-t border-paper/15 pt-8 sm:grid-cols-4 md:gap-10">
          <div>
            <h3 className="label text-brand-red">Core Desks</h3>
            <ul className="mt-3 flex flex-col gap-2 text-xs font-light text-paper/75">
              <li><Link href="/category/nigerian-current-affairs" className="hover:text-brand-red">Nigerian Current Affairs</Link></li>
              <li><Link href="/category/practical-nigerian-updates" className="hover:text-brand-red">Practical Nigerian Updates</Link></li>
              <li><Link href="/category/business-institutions" className="hover:text-brand-red">Business &amp; Institutions</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="label text-brand-red">Culture &amp; Narratives</h3>
            <ul className="mt-3 flex flex-col gap-2 text-xs font-light text-paper/75">
              <li><Link href="/category/entertainment-internet-culture" className="hover:text-brand-red">Entertainment &amp; Internet Culture</Link></li>
              <li><Link href="/category/stories-romance" className="hover:text-brand-red">Stories &amp; Romance</Link></li>
              <li><Link href="/#dossier-heading" className="hover:text-brand-red">Weekend Editorial Dossier</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="label text-brand-red">Primary Channels</h3>
            <ul className="mt-3 flex flex-col gap-2 text-xs font-light text-paper/75">
              <li><Link href="/#distribution" className="hover:text-brand-red">Website, Facebook &amp; X Wire</Link></li>
              <li><Link href="/#distribution" className="hover:text-brand-red">TikTok &amp; Internet Culture</Link></li>
              <li><Link href="/#distribution" className="hover:text-brand-red">Executive Briefing Newsletter</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="label text-brand-red">Network</h3>
            <ul className="mt-3 flex flex-col gap-2 text-xs font-light text-paper/75">
              <li><Link href="/about" className="hover:text-brand-red">About &amp; Editorial Charter</Link></li>
              <li><Link href="/#distribution" className="hover:text-brand-red">Wire Syndication API</Link></li>
              <li><Link href={`mailto:${SITE.email}`} className="hover:text-brand-red">Newsroom &amp; Bureau Contact</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-[0.8rem] text-ink-soft md:mt-8">
        <div className="flex items-center gap-2">
          <span>© {new Date().getFullYear()} {SITE.name}. All Rights Reserved.</span>
          <span className="text-ink-soft/40">·</span>
          <span>Abuja · Lagos · London</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/privacy" className="transition-colors hover:text-brand-red">
            Privacy
          </Link>
          <Link href="/terms" className="transition-colors hover:text-brand-red">
            Terms
          </Link>
          <Link href="/#top" className="font-num transition-colors hover:text-brand-red">
            Back to top ↑
          </Link>
        </div>
      </div>
    </footer>
  );
}
