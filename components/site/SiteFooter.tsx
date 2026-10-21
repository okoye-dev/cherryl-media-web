import Link from "next/link";
import { SITE } from "@/config/site";
import Pill from "./Pill";
import SocialLinks from "./SocialLinks";
import AdireBand from "./AdireBand";
import { getEditorialCopy } from "@/lib/settings";

export default async function SiteFooter() {
  const copy = await getEditorialCopy();

  return (
    <footer
      id="contact"
      className="mx-auto w-full max-w-[90rem] px-5 pb-6 pt-16 md:px-10 md:pb-10 md:pt-28 xl:px-16"
    >
      <div className="overflow-hidden rounded-[1.75rem] bg-night px-6 pt-8 text-snow md:rounded-[2rem] md:px-12 md:pt-12">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
          <div className="max-w-xl min-w-0">
            <h2 className="font-area text-[clamp(1.8rem,4vw,3.4rem)] font-semibold leading-[0.98] tracking-[-0.03em] text-snow text-balance">
              Reporting the stories <em className="font-display italic font-light text-brand-red">shaping contemporary Africa.</em>
            </h2>
            <p className="mt-4 text-sm font-light leading-relaxed text-snow/70 text-pretty">
              {copy.footer.tagline || "Direct intelligence from sub-national corridors, enterprise hubs, and cultural frontiers."}
            </p>
          </div>

          <div className="flex min-w-0 max-w-full flex-col items-start gap-3">
            <span className="label text-snow/50">NEWSROOM CONTACT</span>
            <Pill
              href={`mailto:${copy.footer.contactEmail || SITE.email}`}
              variant="onDark"
              className="max-w-full shrink whitespace-normal break-all"
            >
              {copy.footer.contactEmail || SITE.email}
            </Pill>
            <SocialLinks />
          </div>
        </div>


        <div className="mt-12 grid grid-cols-2 gap-8 border-t border-snow/15 pt-8 sm:grid-cols-3 md:gap-10">
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
        <AdireBand className="-mx-6 mt-10 block w-[calc(100%+3rem)] md:-mx-12 md:mt-12 md:w-[calc(100%+6rem)]" />
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
