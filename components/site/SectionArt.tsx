import { Ripples, Contours, Network, Bubbles, Waveform } from "@/components/art";

/**
 * Huge, faint artwork that belongs to one homepage section. The piece is chosen for what
 * the section covers, so the page has a reason for every shape:
 *   ripples   the dispatch going out, like a broadcast (hero)
 *   contours  State Affairs and Environs: the lay of the land
 *   network   Brands and SMEs: businesses linked into a market
 *   bubbles   Opinions and Perspectives: a conversation
 *   waveform  Culture: music, film and broadcast
 * The footer's adire pattern and the newsletter's Lagos sunrise are separate, and these
 * pieces never reuse their shapes. Every piece fades out in one direction, down and a little sideways.
 *
 * Place it as the first child of a section that has "relative isolate". It sits behind the
 * section's content, never takes clicks, and drifts slowly as you scroll.
 */
const ART = {
  ripples: { Piece: Ripples, cls: "bd-drift right-[-24vw] top-[-14vw] h-[84vw] w-[84vw] opacity-[0.03] fade-dl" },
  contours: { Piece: Contours, cls: "bd-drift left-[-26vw] top-[-6vw] h-[78vw] w-[78vw] opacity-[0.045] fade-dr" },
  network: { Piece: Network, cls: "bd-drift right-[-12vw] top-[-6vw] h-[44vw] w-[96vw] opacity-[0.075] fade-dl" },
  bubbles: { Piece: Bubbles, cls: "bd-drift right-[-14vw] bottom-[-8vw] h-[48vw] w-[74vw] opacity-[0.045] fade-dl" },
  waveform: { Piece: Waveform, cls: "bd-drift left-[-6vw] top-[4vw] h-[26vw] w-[112vw] opacity-[0.06] fade-dr" },
} as const;

export type SectionArtName = keyof typeof ART;

export default function SectionArt({ name }: { name: SectionArtName }) {
  const { Piece, cls } = ART[name];
  return (
    <div aria-hidden="true" className="pointer-events-none">
      <Piece className={`absolute -z-10 max-w-none ${cls}`} />
    </div>
  );
}
