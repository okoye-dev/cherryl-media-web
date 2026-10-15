const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const outDir = "/tmp/placeholders";
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const images = [
  {
    key: "1b8e4f20-9111-5333-8222-777788889999",
    category: "CURRENT AFFAIRS",
    kicker: "LEGISLATIVE ACCORD · INFRASTRUCTURE",
    headline: "Climate Resilience & Drainage Infrastructure Act",
    subtitle: "National Assembly ratifies statutory funding for regional stormwater defenses",
    gradientStart: "#0B2B26",
    gradientEnd: "#1A423B",
  },
  {
    key: "2c9f5a31-9222-5444-8333-888899990000",
    category: "PRACTICAL UPDATES",
    kicker: "COMMUTER SAFETY · PUBLIC SERVICE",
    headline: "Digital Passenger Manifests for Inter-State Transit",
    subtitle: "Road Safety Commission enforces electronic ticketing registries across 36 states",
    gradientStart: "#18191E",
    gradientEnd: "#282B34",
  },
  {
    key: "3d0a6b42-9333-5555-8444-999900001111",
    category: "PRACTICAL UPDATES",
    kicker: "CONSUMER ADVISORY · ENERGY",
    headline: "Residential Solar Inverter & Battery Quality Marks",
    subtitle: "Standards Organisation of Nigeria mandates serialized QR verification codes",
    gradientStart: "#1A1728",
    gradientEnd: "#2E2442",
  },
  {
    key: "4e1b7c53-9444-5666-8555-000011112222",
    category: "BUSINESS & INSTITUTIONS",
    kicker: "CAPITAL MARKETS · INSTITUTIONS",
    headline: "Dual-Listed Infrastructure & Energy REITs Surge",
    subtitle: "Pension asset managers deploy N1.2 trillion into high-yielding local concessions",
    gradientStart: "#0F1E29",
    gradientEnd: "#1D3547",
  },
  {
    key: "5f2c8d64-9555-5777-8666-111122223333",
    category: "BUSINESS & INSTITUTIONS",
    kicker: "INSTITUTIONAL FINANCE · REAL ESTATE",
    headline: "25% RSA Equity Access for Residential Mortgages",
    subtitle: "PenCom finalizes operational corridors for primary homeownership financing",
    gradientStart: "#1C172B",
    gradientEnd: "#2F2547",
  },
  {
    key: "6a3d9e75-9666-5888-8777-222233334444",
    category: "STORIES & ROMANCE",
    kicker: "MODERN LOVE · CHRONICLES",
    headline: "Midnight Calls Across Time Zones: Lagos to Manchester",
    subtitle: "The emotional logistics and digital rituals of transatlantic long-distance love",
    gradientStart: "#2E1825",
    gradientEnd: "#452136",
  },
  {
    key: "7b4e0f86-9777-5999-8888-333344445555",
    category: "STORIES & ROMANCE",
    kicker: "RELATIONSHIPS · ESSAYS",
    headline: "Love in the Slow Lane: Lekki Expressway Encounters",
    subtitle: "How four hours trapped in commuter gridlock sparked an enduring five-year partnership",
    gradientStart: "#331B1A",
    gradientEnd: "#4D2825",
  },
];

function escapeXml(unsafe) {
  return String(unsafe).replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

async function generate() {
  for (const img of images) {
    const category = escapeXml(img.category);
    const kicker = escapeXml(img.kicker);
    const headline = escapeXml(img.headline);
    const subtitle = escapeXml(img.subtitle);

    const svg = `
      <svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${img.gradientStart}" />
            <stop offset="100%" stop-color="${img.gradientEnd}" />
          </linearGradient>
          <radialGradient id="glow" cx="80%" cy="20%" r="50%">
            <stop offset="0%" stop-color="#C52828" stop-opacity="0.25" />
            <stop offset="100%" stop-color="#C52828" stop-opacity="0" />
          </radialGradient>
        </defs>
        
        <!-- Background -->
        <rect width="1200" height="800" fill="url(#grad)" />
        <rect width="1200" height="800" fill="url(#glow)" />
        
        <!-- Framing Border -->
        <rect x="40" y="40" width="1120" height="720" rx="24" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="2" />
        
        <!-- Brand Header -->
        <text x="80" y="110" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700" letter-spacing="3" fill="#C52828">
          CHERRYL MEDIA · EDITORIAL ARCHIVE
        </text>
        
        <!-- Category Pill -->
        <rect x="80" y="145" width="240" height="34" rx="17" fill="rgba(197, 40, 40, 0.18)" stroke="#C52828" stroke-width="1.5" />
        <text x="200" y="167" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" letter-spacing="1.5" fill="#FFFFFF" text-anchor="middle">
          ${category}
        </text>

        <!-- Kicker -->
        <text x="80" y="240" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="600" letter-spacing="2" fill="rgba(255,255,255,0.7)">
          ${kicker}
        </text>
        
        <!-- Headline -->
        <text x="80" y="320" font-family="Georgia, 'Times New Roman', serif" font-size="44" font-weight="700" fill="#FFFFFF">
          ${headline.slice(0, 48)}
        </text>
        ${headline.length > 48 ? `
        <text x="80" y="380" font-family="Georgia, 'Times New Roman', serif" font-size="44" font-weight="700" fill="#FFFFFF">
          ${headline.slice(48)}
        </text>` : ''}
        
        <!-- Subtitle -->
        <text x="80" y="470" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="400" fill="rgba(255,255,255,0.75)">
          ${subtitle}
        </text>
        
        <!-- Footer / Watermark -->
        <line x1="80" y1="670" x2="1120" y2="670" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
        <text x="80" y="715" font-family="Georgia, serif" font-style="italic" font-size="18" fill="rgba(255,255,255,0.5)">
          Independent journalism &amp; digital media distribution
        </text>
        <text x="1120" y="715" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="600" letter-spacing="2" fill="#C52828" text-anchor="end">
          CHERRYL · 2026
        </text>
      </svg>
    `;

    const outPath = path.join(outDir, `${img.key}.webp`);
    await sharp(Buffer.from(svg))
      .webp({ quality: 90 })
      .toFile(outPath);
    console.log(`Generated: ${outPath}`);
  }
}

generate().catch(console.error);
