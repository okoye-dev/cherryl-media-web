import { Ripples, Contours, Network, Bubbles, Waveform } from "@/components/art";

const ART = {
  ripples: { Piece: Ripples, cls: "bd-drift right-[-24vw] top-[-14vw] h-[84vw] w-[84vw] opacity-[0.03] fade-dl" },
  contours: { Piece: Contours, cls: "bd-drift left-[-26vw] top-[-6vw] h-[78vw] w-[78vw] opacity-[0.045] fade-dr" },
  network: { Piece: Network, cls: "bd-drift right-[-12vw] top-[-6vw] h-[44vw] w-[96vw] opacity-[0.075] fade-dl" },
  bubbles: { Piece: Bubbles, cls: "bd-drift right-[-14vw] bottom-[-8vw] h-[48vw] w-[74vw] opacity-[0.045] fade-dl" },
  waveform: { Piece: Waveform, cls: "bd-drift left-[-6vw] top-[4vw] h-[26vw] w-[112vw] opacity-[0.06] fade-dr" },
} as const;

type SectionArtName = keyof typeof ART;

export default function SectionArt({ name }: { name: SectionArtName }) {
  const { Piece, cls } = ART[name];
  return (
    <div aria-hidden="true" className="pointer-events-none">
      <Piece className={`absolute -z-10 max-w-none ${cls}`} />
    </div>
  );
}
