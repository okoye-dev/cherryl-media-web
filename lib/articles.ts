import type { CanonicalArticle } from "./types";

export const CANONICAL_ARTICLES: CanonicalArticle[] = [
  {
    id: "f81d4fae-7dec-11d0-a765-00a0c91e6bf6",
    slug: "federal-executive-council-approves-unified-energy-framework",
    title: "Federal Executive Council Confirms Unified National Clean Energy Transition Accord",
    kicker: "POLICY DEVELOPMENT · GOVERNANCE",
    deck: "Confirmed policy shifts introduce immediate tariff restructuring, regional mini-grid guarantees, and multi-state transmission oversight protocols.",
    category: "nigerian-current-affairs",
    categoryName: "Nigerian Current Affairs",
    author: {
      name: "Tunde Oladipo",
      role: "Senior Policy Correspondent",
    },
    featuredImage: {
      url: "/assets/images/clean-energy-summit.webp",
      caption: "Ministerial council convenes during the extraordinary session in Abuja.",
      credit: "Federal Information Bureau",
    },
    readTime: "4 min read",
    publishedAt: "2026-10-14T08:30:00Z",
    status: "published",
    isLead: true,
    urgent: true,
    body: [
      {
        type: "paragraph",
        isDropCap: true,
        text: "The Federal Executive Council has ratified an inter-ministerial policy framework aimed at overhauling state-level power generation and establishing sub-national regulatory corridors. Under the resolution finalized yesterday in Abuja, commercial developers will gain direct access to regional distribution networks without prior federal concession bottlenecks.",
      },
      {
        type: "quote",
        quote: "Our objective is to allow state governments and private capital to build dedicated industrial feeder lines without navigating redundant bureaucratic layers.",
        author: "Chief Adebayo Adelabu",
        context: "Minister of Power",
      },
      {
        type: "paragraph",
        text: "Under the provisions of the 2023 Electricity Act now reaching full operational maturation, eight states have officially completed the transfer of regulatory oversight from the Nigerian Electricity Regulatory Commission (NERC) to state electricity regulatory boards. This decentralized posture is already triggering private liquidity inflows into localized gas-to-power and solar hybrid hubs across Ogun, Oyo, and Kano corridors.",
      },
      {
        type: "image",
        src: "/assets/images/solar-substation.webp",
        caption: "Regional mini-grid substation installation in Ogun State industrial corridor.",
        credit: "Photo: Cherryl Media Field Archive",
        alt: "Mini-grid solar distribution substation",
      },
      {
        type: "heading",
        level: 2,
        text: "Fiscal Provisions and State Feeder Guarantees",
      },
      {
        type: "paragraph",
        text: "Crucially, the new framework mandates that distribution companies (DisCos) ring-fence industrial consumers on Band A feeders, ensuring that tariff pricing directly correlates with measured, metered uptime. Violations will trigger automated billing credits back to end consumers through unified metering software.",
      },
      {
        type: "internal_link",
        title: "NERC Releases Reclassified State Feeder Bands and Consumer Metering Schedule",
        slug: "nigeria-electricity-regulatory-commission-updates-feeder-bands",
        category: "Practical Nigerian Updates",
        deck: "Official public-service advisory detailing guaranteed supply hours, revised band thresholds, and direct customer dispute mechanisms.",
        readTime: "3 min read",
      },
      {
        type: "paragraph",
        text: "Economic observers note that while currency fluctuations continue to impact imported turbine equipment, long-term bilateral guarantees provided by sovereign infrastructure funds have mitigated immediate financing risk.",
      },
      {
        type: "external_link",
        title: "Federal Ministry of Power: Official Gazette on State Energy Decentralization (PDF)",
        url: "https://nerc.gov.ng",
        publisher: "NERC Regulatory Portal",
        verified: true,
      },
    ],
    sourceLinks: [
      {
        url: "https://statehouse.gov.ng",
        publisher: "State House Communications",
        accessedAt: "2026-10-14T08:00:00Z",
      },
      {
        url: "https://nerc.gov.ng",
        publisher: "NERC Official Gazette",
        accessedAt: "2026-10-14T08:15:00Z",
      },
    ],
    channelVariants: {
      x: "BREAKING: Federal Executive Council ratifies unified national clean energy accord. State governments now empowered to licence commercial mini-grids directly. Here's what this means for industrial power tariffs 🧵👇",
      facebook: "The Federal Executive Council has officially confirmed a major shift in Nigeria's energy policy. State governments and private developers will now be able to build and regulate commercial mini-grids without prior federal delays. Read our full explainer on who is affected.",
      linkedin: "Policy Analysis: Nigeria's Federal Executive Council has confirmed a unified clean energy transition framework, concluding the devolution of electricity regulation to sub-national commissions. For corporate energy buyers and infrastructure funds, this represents a structural change in off-grid power procurement.",
      newsletter: "Today's Lead Story: The Federal Executive Council decentralized industrial power generation. We break down the tariff restructuring, state feeder guarantees, and investment implications.",
    },
  },
  {
    id: "a3b2c1d0-1234-4567-89ab-cdef01234567",
    slug: "nigeria-electricity-regulatory-commission-updates-feeder-bands",
    title: "NERC Releases Reclassified State Feeder Bands and Consumer Metering Schedule",
    kicker: "CONSUMER ADVISORY · PUBLIC SERVICE",
    deck: "Official public-service advisory detailing guaranteed supply hours, revised band thresholds, and direct customer dispute mechanisms.",
    category: "practical-nigerian-updates",
    categoryName: "Practical Nigerian Updates",
    author: {
      name: "Bisi Alabi",
      role: "Public Service & Utility Reporter",
    },
    featuredImage: {
      url: "/assets/images/metering-rollout.webp",
      caption: "Technicians deploy smart meters in residential zones.",
      credit: "NERC Communications",
    },
    readTime: "3 min read",
    publishedAt: "2026-10-14T09:15:00Z",
    status: "published",
    urgent: false,
    body: [
      {
        type: "paragraph",
        isDropCap: true,
        text: "The Nigerian Electricity Regulatory Commission has issued an updated national schedule for consumer feeder bands, clarifying minimum daily service thresholds and enforcement channels across all eleven electricity distribution franchises.",
      },
      {
        type: "heading",
        level: 2,
        text: "What Changed for Residential and Commercial Consumers",
      },
      {
        type: "paragraph",
        text: "Under the revised metrics, Band A customers must receive a verified minimum of 20 hours daily. Any feeder that fails to maintain this threshold over three consecutive billing cycles must automatically be downgraded to Band B, with consumer billing adjusted downward immediately.",
      },
      {
        type: "quote",
        quote: "Consumers must not be billed for service tiers that their feeder lines do not physically deliver.",
        author: "Engr. Sanusi Garba",
        context: "NERC Chairman",
      },
      {
        type: "external_link",
        title: "National Consumer Complaint Portal & Feeder Checker",
        url: "https://nerc.gov.ng/complaints",
        publisher: "NERC Public Service Portal",
        verified: true,
      },
    ],
    sourceLinks: [
      {
        url: "https://nerc.gov.ng",
        publisher: "NERC Commission",
        accessedAt: "2026-10-14T09:00:00Z",
      },
    ],
    channelVariants: {
      x: "PRACTICAL UPDATE: NERC releases revised feeder band schedule. If your Band A feeder drops below 20 hrs/day for 3 days, DisCos must downgrade your tariff. Check your feeder status here ⚡",
      facebook: "Important electricity update for Nigerian households: NERC has clarified the rules for Band A, B, and C feeders. DisCos are now required to issue automatic billing credits if daily hours fall below standard.",
    },
  },
  {
    id: "b4c3d2e1-5678-90ab-cdef-1234567890ab",
    slug: "lagos-soundscapes-and-creators-revolution",
    title: "Inside the TikTok to Global Stage Pipeline: How Lagos Creators Reshape Pop Culture",
    kicker: "VIRAL CULTURE & MUSIC",
    deck: "From viral sound challenges to sold-out arenas: tracing how independent West African beatmakers turned internet culture into commercial leverage.",
    category: "entertainment-internet-culture",
    categoryName: "Entertainment & Internet Culture",
    author: {
      name: "Tomiwa Adeleke",
      role: "Culture & Trends Editor",
    },
    featuredImage: {
      url: "/assets/images/lagos-studio.webp",
      caption: "Bedroom producer sessions transforming into global streaming hits.",
      credit: "Cherryl Media Sound Archive",
    },
    readTime: "5 min read",
    publishedAt: "2026-10-13T16:00:00Z",
    status: "published",
    urgent: false,
    body: [
      {
        type: "paragraph",
        isDropCap: true,
        text: "In small home studios across Yaba, Surulere, and Festac, twenty-year-old beatmakers are executing marketing campaigns that legacy record labels spend millions attempting to replicate. By designing 15-second loopable polyrhythms built specifically for TikTok dance challenges, these creators have reversed the traditional music distribution funnel.",
      },
      {
        type: "quote",
        quote: "We don't pitch radio stations anymore. The audience votes with 100,000 video creations before the full track is even uploaded to DSPs.",
        author: "P.Priime",
        context: "Record Producer",
      },
      {
        type: "image",
        src: "/assets/images/afrobeats-crowd.webp",
        caption: "Audience at a live showcase in Victoria Island singing along to unreleased viral snippets.",
        credit: "Photo: Cherryl Media",
        alt: "Concert crowd enjoying Afrobeats performance",
      },
      {
        type: "paragraph",
        text: "The financial architecture behind this shift is equally remarkable. Direct micropayments, digital brand partnerships, and independent distribution aggregator deals allow West African artists to retain up to 85% of their master rights.",
      },
    ],
    sourceLinks: [
      {
        url: "https://chartdata.org",
        publisher: "Chart Data West Africa",
        accessedAt: "2026-10-13T15:30:00Z",
      },
    ],
    channelVariants: {
      x: "How Lagos bedroom producers engineered a direct TikTok-to-O2 Arena pipeline without signing 360 label contracts. A deep dive into the business of modern African soundscapes 🎵🔥",
      facebook: "Nollywood and Nigerian music are experiencing a distribution revolution. Here is how young producers in Lagos are bypassing traditional labels to create global hits directly on social platforms.",
    },
  },
  {
    id: "c5d4e3f2-9012-3456-789a-bcdef0123456",
    slug: "cbn-leadership-announces-cross-border-fintech-settlement-rails",
    title: "Central Bank and AFC Formalize Unified Cross-Border Settlement Infrastructure",
    kicker: "FINTECH & INSTITUTIONS",
    deck: "Institutional announcement introduces local-currency trade settlement for commercial banks and registered payment switches.",
    category: "business-institutions",
    categoryName: "Business & Institutions",
    author: {
      name: "Chukwudi Nwosu",
      role: "Capital Markets Analyst",
    },
    featuredImage: {
      url: "/assets/images/afc-signing.webp",
      caption: "Central Bank leadership and AFC executives exchange bilateral agreements.",
      credit: "AFC Media Desk",
    },
    readTime: "4 min read",
    publishedAt: "2026-10-12T11:00:00Z",
    status: "published",
    urgent: false,
    body: [
      {
        type: "paragraph",
        isDropCap: true,
        text: "The Central Bank of Nigeria and the Africa Finance Corporation have jointly unveiled the Pan-African Local Currency Settlement Protocol (PALC-SP). The system enables authorized Nigerian fintechs and commercial banks to clear regional cross-border transactions in domestic currencies, cutting trade reliance on foreign exchange correspondent accounts.",
      },
      {
        type: "quote",
        quote: "Intra-African commerce cannot expand if a trader in Lagos paying a supplier in Accra must route liquidity through New York or London.",
        author: "Olayemi Cardoso",
        context: "CBN Governor",
      },
      {
        type: "paragraph",
        text: "The initial rollout integrates 14 commercial lenders and 6 licensed mobile money operators, with transaction settlement guaranteed in T+0 real time.",
      },
    ],
    sourceLinks: [
      {
        url: "https://cbn.gov.ng",
        publisher: "Central Bank Communications",
        accessedAt: "2026-10-12T10:45:00Z",
      },
    ],
    channelVariants: {
      linkedin: "Strategic Development: The Central Bank of Nigeria and AFC have launched a local-currency trade settlement protocol. This significantly lowers transaction frictions for intra-African commerce and corporate treasuries.",
      x: "INSTITUTIONAL WIRE: CBN & AFC formalize local-currency cross-border trade rails. Nigerian banks can now settle intra-African payments without dollar intermediary hops.",
    },
  },
  {
    id: "d6e5f4a3-1122-3344-5566-778899aabbcc",
    slug: "conversations-on-third-mainland-bridge-at-dusk",
    title: "Conversations on the Bridge at Dusk: Modern Love, Hustle, and Lagos Distance",
    kicker: "ESSAYS & MODERN LOVE",
    deck: "A personal narrative on romance across the mainland-island divide, unspoken compromises, and the quiet beauty of evening transit.",
    category: "stories-romance",
    categoryName: "Stories & Romance",
    author: {
      name: "Amara Okonkwo",
      role: "Special Features Columnist",
    },
    featuredImage: {
      url: "/assets/images/lagos-dusk.webp",
      caption: "Brake lights reflecting over the lagoon as twilight settles over Lagos.",
      credit: "Urban Lens Archive",
    },
    readTime: "6 min read",
    publishedAt: "2026-10-11T17:30:00Z",
    status: "published",
    urgent: false,
    body: [
      {
        type: "paragraph",
        isDropCap: true,
        text: "In Lagos, geography is the unspoken third party in every relationship. To love someone who lives in Ikeja when your office and bedroom are in Lekki Phase 1 is to accept that romance will be measured not in flowers or dinners, but in kilometers of asphalt and the temperament of the Third Mainland Bridge.",
      },
      {
        type: "paragraph",
        text: "We learned to time our conversations by the movement of commuter yellow buses. 'I'm at Adekunle,' meant you had eight minutes before the signal dipped. 'I just hit Adeniji,' meant relief was imminent.",
      },
      {
        type: "quote",
        quote: "We built an entire vocabulary out of traffic reports and voice notes sent during standstill gridlock.",
        author: "Amara Okonkwo",
      },
      {
        type: "paragraph",
        text: "Yet, when the sun sinks into the lagoon and the evening sky turns a bruised shade of violet and terracotta, there is a singular tenderness to this city. You realize that endurance is itself a language of care.",
      },
    ],
    sourceLinks: [
      {
        url: "https://cherryl.media/stories",
        publisher: "Cherryl Stories & Culture Bureau",
        accessedAt: "2026-10-11T17:00:00Z",
      },
    ],
    channelVariants: {
      newsletter: "Weekend Essay: 'Conversations on the Bridge at Dusk' — Amara Okonkwo on modern love, long commutes, and finding tenderness in the world's most relentless city.",
      x: "'In Lagos, geography is the unspoken third party in every relationship.' A Saturday narrative on modern courtship, distance, and evening transit ❤️📖",
    },
  },
];

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:8080";

async function fetchLiveArticles(): Promise<CanonicalArticle[]> {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return CANONICAL_ARTICLES;
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/articles?status=published`, {
      next: { revalidate: 30 },
      signal: AbortSignal.timeout(800),
    });
    if (!res.ok) return CANONICAL_ARTICLES;
    const articles: CanonicalArticle[] = await res.json();
    if (!Array.isArray(articles) || articles.length === 0) {
      return CANONICAL_ARTICLES;
    }
    return articles;
  } catch {
    return CANONICAL_ARTICLES;
  }
}

export async function getLeadStory(): Promise<CanonicalArticle> {
  const articles = await fetchLiveArticles();
  return articles.find((a) => a.isLead) || articles[0] || CANONICAL_ARTICLES[0];
}

export async function getDispatches(): Promise<CanonicalArticle[]> {
  const articles = await fetchLiveArticles();
  return articles.filter((a) => !a.isLead);
}

export async function getArticleBySlug(slug: string): Promise<CanonicalArticle | null> {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return CANONICAL_ARTICLES.find((a) => a.slug === slug) || null;
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/articles/${encodeURIComponent(slug)}`, {
      next: { revalidate: 30 },
      signal: AbortSignal.timeout(800),
    });
    if (res.ok) {
      const art: CanonicalArticle = await res.json();
      if (art && art.slug) return art;
    }
  } catch {}
  return CANONICAL_ARTICLES.find((a) => a.slug === slug) || null;
}

export async function getArticlesByCategory(categorySlug: string): Promise<CanonicalArticle[]> {
  const articles = await fetchLiveArticles();
  return articles.filter((a) => a.category === categorySlug);
}

export async function getAllArticleSlugs(): Promise<string[]> {
  return CANONICAL_ARTICLES.map((a) => a.slug);
}

