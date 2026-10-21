import Link from "next/link";
import { SITE } from "@/config/site";
import Pill from "./Pill";
import SocialLinks from "./SocialLinks";
import { AdirePattern, LagosSkyline } from "@/components/art";
import { fetchEditorialCopy } from "@/services/settings";

export default async function SiteFooter() {
  const copy = await fetchEditorialCopy();

  return (
    <footer
      id="contact"
      className="relative mx-auto w-full max-w-[90rem] px-5 pb-6 pt-28 md:px-10 md:pb-10 md:pt-56 xl:px-16"
    >
      <LagosSkyline className="pointer-events-none absolute inset-x-0 top-0 h-[12rem] w-full opacity-[0.2] md:h-[18rem]" />
      <div className="relative z-10 overflow-hidden rounded-[1.75rem] bg-night px-6 pb-52 pt-8 text-snow md:rounded-[2rem] md:px-12 md:pb-64 md:pt-12">
        <AdirePattern scale={1.7} className="pointer-events-none absolute inset-x-0 bottom-0 block opacity-80" />
        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-start">
          <div className="max-w-xl min-w-0">
            <h2 className="font-area text-[clamp(1.8rem,4vw,3.4rem)] font-semibold leading-[0.98] tracking-[-0.03em] text-snow text-balance">
              Reporting the stories <em className="font-display italic font-light text-brand-red">shaping contemporary Africa.</em>
            </h2>
            <p className="mt-4 text-sm font-light leading-relaxed text-snow/70 text-pretty">
              {copy.footer.tagline || "Direct intelligence from sub-national corridors, enterprise hubs, and cultural frontiers."}
            </p>
          </div>

          <div className="flex min-w-0 max-w-full flex-col items-start gap-3 md:max-w-none md:shrink-0 md:items-end md:text-right">
            <span className="label text-snow/50">NEWSROOM CONTACT</span>
            <Pill
              href={`mailto:${copy.footer.contactEmail || SITE.email}`}
              variant="onDark"
              className="max-w-full shrink whitespace-normal break-all md:whitespace-nowrap md:break-normal"
            >
              {copy.footer.contactEmail || SITE.email}
            </Pill>
            <SocialLinks className="md:justify-end" />
          </div>
        </div>

        <div className="relative mt-12 grid grid-cols-2 gap-8 border-t border-snow/15 pt-8 sm:grid-cols-3 md:gap-10">
          <div>
            <h3 className="label text-brand-red">Desks</h3>
            <ul className="mt-3 flex flex-col gap-2 text-xs font-light text-snow/75">
              {SITE.categories.slice(0, 5).map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/category/${cat.slug}`} className="hover:text-brand-red">{cat.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="label text-brand-red">More desks</h3>
            <ul className="mt-3 flex flex-col gap-2 text-xs font-light text-snow/75">
              {SITE.categories.slice(5).map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/category/${cat.slug}`} className="hover:text-brand-red">{cat.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="label text-brand-red">Cherryl Media</h3>
            <ul className="mt-3 flex flex-col gap-2 text-xs font-light text-snow/75">
              <li><Link href="/about" className="hover:text-brand-red">About us</Link></li>
              <li><Link href="/#newsletter" className="hover:text-brand-red">Morning Edition newsletter</Link></li>
              <li><a href={`mailto:${copy.footer.contactEmail || SITE.email}`} className="hover:text-brand-red">Contact the newsroom</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-[0.8rem] text-ink-soft md:mt-8">
        <div className="flex items-center gap-2">
          <span>{copy.footer.copyrightNotice || `© ${new Date().getFullYear()} ${SITE.name}. All Rights Reserved.`}</span>
          <span className="text-ink-soft/40">·</span>
          <span>{copy.footer.locations || "Abuja · Lagos · London"}</span>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/#top" className="font-num transition-colors hover:text-brand-red">
            Back to top ↑
          </Link>
        </div>
      </div>
    </footer>
  );
}
