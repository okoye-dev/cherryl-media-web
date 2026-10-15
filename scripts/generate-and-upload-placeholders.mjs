import fs from "fs";
import path from "path";
import sharp from "sharp";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";
const CDN_BASE = "https://pub-ceebfc5378214f48bb3d7ec7b50b0901.r2.dev";

const ASSETS = [
  {
    storageKey: "media/articles/clean-energy-summit.webp",
    category: "CURRENT AFFAIRS · POLICY",
    title: "Clean Energy Transition Accord",
    subtitle: "Federal Executive Council Ratifies National Decentralization Corridors",
    edition: "VOL. 04 · SPECIAL REPORT",
    accentColor: "#c92a2a",
  },
  {
    storageKey: "media/articles/solar-substation.webp",
    category: "INFRASTRUCTURE · FIELD ARCHIVE",
    title: "Regional Mini-Grid Substation",
    subtitle: "Ogun Industrial Feeder Line & Solar Substation Deployment",
    edition: "FIELD NOTES · DESK DISPATCH",
    accentColor: "#d97706",
  },
  {
    storageKey: "media/articles/metering-rollout.webp",
    category: "PRACTICAL UPDATES · PUBLIC SERVICE",
    title: "Smart Metering & Feeder Schedules",
    subtitle: "NERC Reclassified Bands & Direct Customer Recourse Framework",
    edition: "CONSUMER ADVISORY · 2026",
    accentColor: "#2563eb",
  },
  {
    storageKey: "media/articles/lagos-studio.webp",
    category: "ENTERTAINMENT · CULTURE",
    title: "Nollywood Studio Architecture",
    subtitle: "From Direct-to-Video Roots to Global Distribution Dominance",
    edition: "WEEKEND DOSSIER · ESSAY",
    accentColor: "#7c3aed",
  },
  {
    storageKey: "media/articles/afrobeats-crowd.webp",
    category: "MUSIC & SOUNDSCAPES",
    title: "Global Afro-Fusion Arenas",
    subtitle: "West African Acoustic Resonance & Stadium Live Engagements",
    edition: "CULTURE ARCHIVE · ISSUE 18",
    accentColor: "#db2777",
  },
  {
    storageKey: "media/articles/afc-signing.webp",
    category: "BUSINESS & INSTITUTIONS",
    title: "Cross-Border Fintech Settlement",
    subtitle: "Central Bank & Regional Clearing Settlement Infrastructure",
    edition: "MARKETS & POLICY · MONETARY",
    accentColor: "#059669",
  },
  {
    storageKey: "media/articles/lagos-dusk.webp",
    category: "STORIES & ROMANCE · MEMOIR",
    title: "Third Mainland Bridge at Dusk",
    subtitle: "Conversations Across the Lagoon and the Architecture of Modern Longing",
    edition: "LITERARY DISPATCH · LAGOS",
    accentColor: "#e11d48",
  },
  {
    storageKey: "media/articles/transport-safety.webp",
    category: "PRACTICAL UPDATES · TRANSIT",
    title: "Regional Rail & Transit Safety",
    subtitle: "Federal Transport Ministry Operational Protocols and Standards",
    edition: "PUBLIC ADVISORY · METRO",
    accentColor: "#0891b2",
  },
  {
    storageKey: "media/articles/smart-metering.webp",
    category: "ENERGY & UTILITIES",
    title: "Direct Smart Meter Rollout",
    subtitle: "Distribution Franchises Commence Phase 2 Consumer Installations",
    edition: "UTILITIES REPORT · PHASE 2",
    accentColor: "#4f46e5",
  },
  {
    storageKey: "media/articles/trade-finance.webp",
    category: "BUSINESS & FINANCE",
    title: "Sovereign Trade Finance Facilities",
    subtitle: "Commercial Lenders Expand Local Currency Credit Windows",
    edition: "FINANCIAL INTELLIGENCE",
    accentColor: "#0d9488",
  },
  {
    storageKey: "media/articles/awolowo-road.webp",
    category: "STORIES & ROMANCE",
    title: "Letters on Awolowo Road",
    subtitle: "Afternoon Rains, Corner Cafes, and the Intimacy of Modern Distance",
    edition: "ESSAY & PROSE · IKOYI",
    accentColor: "#be185d",
  },
  {
    storageKey: "media/articles/afro-fusion-studio.webp",
    category: "ACOUSTICS & PRODUCTION",
    title: "Underground Polyphonic Afro-Fusion",
    subtitle: "Surulere Sound Architects Engineering Analog Synthesizer Rhythms",
    edition: "AUDIO CHRONICLES · STUDIO",
    accentColor: "#9333ea",
  },
  {
    storageKey: "media/articles/indigenous-grains.webp",
    category: "CULTURE & GASTRONOMY",
    title: "Revival of Indigenous Grains",
    subtitle: "Fermentation, Coastal Smoke & West African Heritage Agriculture",
    edition: "BOTANICAL & CULINARY DESK",
    accentColor: "#b45309",
  },
  {
    storageKey: "media/articles/art-x-lagos.webp",
    category: "VISUAL ARTS & EXHIBITIONS",
    title: "Art X Lagos International Pavilions",
    subtitle: "Forty-Two Curated Galleries Convene on Victoria Island",
    edition: "CURATORIAL REPORT · 2026",
    accentColor: "#c026d3",
  },
  {
    storageKey: "media/articles/highlife-wax.webp",
    category: "HISTORICAL ARCHIVES",
    title: "Preserving Vintage Highlife Wax",
    subtitle: "Sound Archivists Digitizing Historic Accra and Lagos Vinyl Sessions",
    edition: "HERITAGE RESTORATION DESK",
    accentColor: "#ea580c",
  },
  {
    storageKey: "media/articles/sahelian-earth.webp",
    category: "URBAN ARCHITECTURE",
    title: "Sahelian Earth Hubs & Passive Cooling",
    subtitle: "Bioclimatic Innovations and Ancient Masonry in Modern Cities",
    edition: "SPATIAL DESIGN & CLIMATE",
    accentColor: "#65a30d",
  },
  {
    storageKey: "media/articles/independent-comics.webp",
    category: "GRAPHIC NOVELS & FOLKLORE",
    title: "Independent Comics Guild Anthology",
    subtitle: "Illustrators Reimagining Regional Mythology for Contemporary Readers",
    edition: "ILLUSTRATION & PRINT DESK",
    accentColor: "#eab308",
  },
];

function generateSvg({ category, title, subtitle, edition, accentColor }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f1118" />
      <stop offset="60%" stop-color="#161822" />
      <stop offset="100%" stop-color="#0b0c10" />
    </linearGradient>
    <linearGradient id="accentGlow" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.8" />
      <stop offset="100%" stop-color="${accentColor}" stop-opacity="0.1" />
    </linearGradient>
    <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#ffffff" stroke-opacity="0.03" stroke-width="1"/>
    </pattern>
  </defs>

  <!-- Deep ink background -->
  <rect width="1200" height="800" fill="url(#bgGrad)" />
  <rect width="1200" height="800" fill="url(#grid)" />

  <!-- Frame border -->
  <rect x="40" y="40" width="1120" height="720" rx="20" fill="none" stroke="#ffffff" stroke-opacity="0.08" stroke-width="1.5" />

  <!-- Top accent line -->
  <line x1="80" y1="40" x2="360" y2="40" stroke="${accentColor}" stroke-width="4" stroke-linecap="round" />

  <!-- Monogram & Brand header -->
  <g transform="translate(80, 95)">
    <!-- Brand Mark -->
    <rect x="0" y="0" width="36" height="36" rx="8" fill="${accentColor}" />
    <text x="18" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="19" fill="#ffffff" text-anchor="middle">C</text>
    <text x="50" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="14" fill="#ffffff" letter-spacing="3.5">CHERRYL MEDIA</text>
    <text x="210" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="500" font-size="12" fill="#71717a" letter-spacing="1.5">· JOURNALISM ARCHIVE</text>
  </g>

  <!-- Category & Edition Badge -->
  <g transform="translate(80, 180)">
    <rect x="0" y="0" width="340" height="34" rx="17" fill="#ffffff" fill-opacity="0.06" stroke="#ffffff" stroke-opacity="0.1" />
    <circle cx="17" cy="17" r="5" fill="${accentColor}" />
    <text x="32" y="22" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="11" fill="${accentColor}" letter-spacing="2">${escapeXml(category)}</text>
  </g>

  <!-- Main Headline Block -->
  <g transform="translate(80, 310)">
    <text x="0" y="0" font-family="Georgia, 'Times New Roman', serif" font-weight="bold" font-size="52" fill="#f4f4f5" letter-spacing="-0.5">
      ${escapeXml(title)}
    </text>
    <text x="0" y="70" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="400" font-size="24" fill="#a1a1aa" letter-spacing="0">
      ${escapeXml(subtitle)}
    </text>
  </g>

  <!-- Subtle visual accent element -->
  <g transform="translate(80, 480)">
    <line x1="0" y1="0" x2="1040" y2="0" stroke="#ffffff" stroke-opacity="0.08" stroke-width="1" />
    <line x1="0" y1="0" x2="140" y2="0" stroke="url(#accentGlow)" stroke-width="2" />
  </g>

  <!-- Bottom Metadata bar -->
  <g transform="translate(80, 680)">
    <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="600" font-size="12" fill="#71717a" letter-spacing="2">
      ${escapeXml(edition)}
    </text>
    <text x="640" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="500" font-size="12" fill="#52525b" letter-spacing="1">
      VERIFIED EDITORIAL ASSET · CLOUDFLARE R2 CDN
    </text>
    <circle cx="1035" cy="-4" r="4" fill="#22c55e" />
  </g>
</svg>`;
}

function escapeXml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function uploadAsset(asset) {
  const svg = generateSvg(asset);
  const webpBuffer = await sharp(Buffer.from(svg))
    .webp({ quality: 90 })
    .toBuffer();

  const fileName = path.basename(asset.storageKey);
  console.log(`\n[Process] ${asset.storageKey} (${webpBuffer.length} bytes)...`);

  // 1. Request presigned URL from backend
  const presignRes = await fetch(`${BACKEND_URL}/api/uploads/presign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: fileName,
      size: webpBuffer.length,
      content_type: "image/webp",
      custom_key: asset.storageKey,
    }),
  });

  if (!presignRes.ok) {
    throw new Error(`Presign failed (${presignRes.status}): ${await presignRes.text()}`);
  }

  const presignData = await presignRes.json();

  // 2. If not already exists, upload directly to S3 / Cloudflare R2
  if (presignData.upload_url) {
    const s3Res = await fetch(presignData.upload_url, {
      method: "PUT",
      headers: { "Content-Type": "image/webp" },
      body: webpBuffer,
    });
    if (!s3Res.ok) {
      throw new Error(`R2 upload failed (${s3Res.status}): ${await s3Res.text()}`);
    }
    console.log(`  ✓ Uploaded to R2 via presigned URL`);

    // 3. Confirm upload
    const confirmRes = await fetch(`${BACKEND_URL}/api/uploads/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storage_key: presignData.storage_key,
        size: webpBuffer.length,
      }),
    });
    if (!confirmRes.ok) {
      console.warn(`  ! Confirm warning (${confirmRes.status}): ${await confirmRes.text()}`);
    } else {
      console.log(`  ✓ Confirmed with backend`);
    }
  } else {
    console.log(`  ✓ File already present in R2`);
  }

  // 4. Verify public CDN resolution
  const cdnUrl = presignData.public_url || `${CDN_BASE}/${asset.storageKey}`;
  const verifyRes = await fetch(cdnUrl, { method: "HEAD" });
  console.log(`  ✓ Public CDN status: ${verifyRes.status} (${cdnUrl})`);

  return {
    storageKey: asset.storageKey,
    publicUrl: cdnUrl,
    size: webpBuffer.length,
  };
}

async function main() {
  console.log("=== CHERRYL MEDIA EDITORIAL ASSET UPLOADER ===");
  console.log(`Target Backend: ${BACKEND_URL}`);
  console.log(`Total Assets to Generate & Upload: ${ASSETS.length}`);

  const results = {};
  for (const asset of ASSETS) {
    try {
      const res = await uploadAsset(asset);
      results[res.storageKey] = res.publicUrl;
    } catch (err) {
      console.error(`  ✗ Error uploading ${asset.storageKey}:`, err.message);
    }
  }

  const outDir = path.resolve("./lib");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, "uploaded-assets.json"),
    JSON.stringify(results, null, 2)
  );
  console.log(`\nSuccessfully uploaded and saved asset mappings to lib/uploaded-assets.json`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
