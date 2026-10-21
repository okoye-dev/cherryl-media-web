Cherryl Media artwork

Every piece of site artwork lives in this folder. All of it is drawn by hand as SVG, so it stays sharp at any size and needs no image files.

The rules for adding a new piece:
1. One file per asset, named in PascalCase after what it shows, for example Cherries.tsx.
2. The file has a single default export, a component that takes an optional className. Size it from outside with className, never with fixed pixel sizes inside.
3. Pictures that carry meaning take a title prop and set role="img" with an aria-label. Purely decorative pieces set aria-hidden="true" instead.
4. Colours come from the brand: red E01E1E, orange D9601E, light orange F08A24 and FF8A5C, and the dark tone 0C0608. Use currentColor when the piece should follow the text colour.
5. Add the new asset to index.ts, and import it from "@/components/art".

Current assets:
SunriseLagos, the wide sunrise scene with the Lekki-Ikoyi bridge, used in the newsletter block.
AdirePattern, the five-row adire pattern that fades upward, used in the footer.
EditionStamp, the round Morning Edition stamp.
Cherries, the brand mark.
Sparkle, a four-point star.
CowrieRing, concentric rings with a dotted heart.
Ripples, thin rings spreading from one point with no fill, behind the hero.
LagosSkyline, filled silhouettes of the Lagos skyline (National Theatre dome, Lekki bridge, Eko Atlantic towers), behind the top edge of the footer card.
Contours, topographic rings, behind State Affairs.
Network, nodes joined by lines, behind Brands and SMEs.
Bubbles, overlapping speech bubbles, behind Opinions.
Waveform, a sound wave in rounded bars, behind Culture.

Section artwork is placed through components/site/SectionArt.tsx. The rule there: every big piece must be chosen for what its section covers, and must not reuse the footer's adire shapes or the newsletter's Lagos scene.

AdirePattern also takes a scale prop to enlarge its motifs.
