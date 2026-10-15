import fs from "fs";
import path from "path";
import sharp from "sharp";

const OUT_DIR = "/tmp/clean_photos";
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const UUID_KEYS = [
  "media/e826f4da-b7b7-5120-bb2b-f466b33a929c.webp",
  "media/ece0db31-b6f8-5eaf-9278-c901b46acfee.webp",
  "media/f5aa1481-2d88-5159-9d90-91676df84733.webp",
  "media/fff4d6db-84bb-523d-ae18-2d8451490929.webp",
  "media/3d6b3a23-ffaf-5df6-82db-f51fa5077518.webp",
  "media/a2cf6f5d-8512-576f-b87f-8364d19d46ee.webp",
  "media/99f72c5d-6c90-5d7e-a61d-2928952e13e7.webp",
  "media/bc51d838-573d-5947-9372-ac03075b98e8.webp",
  "media/4958ea81-ae31-51f0-a893-74090ea4b453.webp",
  "media/d44aee35-6b1f-5212-bc28-f78f1f061864.webp",
  "media/21b50b9b-85ec-5dae-9116-ebade33a41e8.webp",
  "media/68d885ad-623f-5769-b9ea-6deb64c1b762.webp",
  "media/a3bd1c2d-ca6a-5a2c-900d-75461a3a4078.webp",
  "media/a439611c-2737-5bf1-8b0b-c5933ceee3e3.webp",
  "media/c378c8dc-0c2f-5281-ae2e-8f920bde290d.webp",
  "media/fa264975-1c61-5ce2-8f5b-ce07127defe5.webp",
  "media/64185597-9d0e-55ba-b4fc-d997c55868ad.webp",
  "media/1b8e4f20-9111-5333-8222-777788889999.webp",
  "media/2c9f5a31-9222-5444-8333-888899990000.webp",
  "media/3d0a6b42-9333-5555-8444-999900001111.webp",
  "media/4e1b7c53-9444-5666-8555-000011112222.webp",
  "media/5f2c8d64-9555-5777-8666-111122223333.webp",
  "media/6a3d9e75-9666-5888-8777-222233334444.webp",
  "media/7b4e0f86-9777-5999-8888-333344445555.webp",
];

const ALIASES = JSON.parse(
  fs.readFileSync(path.resolve("website/lib/uploaded-assets.json"), "utf8")
);

async function downloadWithRetry(url, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { redirect: "follow" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const arrayBuffer = await res.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
}

async function main() {
  console.log(`Starting download of 24 clean real photographs...`);

  // Manifest mapping storageKey -> local filepath
  const manifest = {};

  for (let i = 0; i < UUID_KEYS.length; i++) {
    const key = UUID_KEYS[i];
    const seed = i + 101; // deterministic variety
    const url = `https://picsum.photos/1200/800?random=${seed}`;
    process.stdout.write(`Fetching photo ${i + 1}/${UUID_KEYS.length} (seed ${seed})... `);

    try {
      const imgBuffer = await downloadWithRetry(url);
      const webpBuffer = await sharp(imgBuffer)
        .resize(1200, 800, { fit: "cover" })
        .webp({ quality: 85 })
        .toBuffer();

      const filename = path.basename(key);
      const targetPath = path.join(OUT_DIR, filename);
      fs.writeFileSync(targetPath, webpBuffer);

      manifest[key] = targetPath;
      console.log(`[OK] saved (${webpBuffer.length} bytes) -> ${key}`);
    } catch (err) {
      console.error(`[FAIL] ${err.message}`);
    }
  }

  // Also map aliases to the exact same files
  for (const [aliasKey, targetUrl] of Object.entries(ALIASES)) {
    const uuidKey = targetUrl.replace(
      "https://pub-ceebfc5378214f48bb3d7ec7b50b0901.r2.dev/",
      ""
    );
    if (manifest[uuidKey]) {
      manifest[aliasKey] = manifest[uuidKey];
    }
  }

  const manifestPath = path.join(OUT_DIR, "manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\nWrote upload manifest with ${Object.keys(manifest).length} keys to ${manifestPath}`);
}

main().catch(console.error);
