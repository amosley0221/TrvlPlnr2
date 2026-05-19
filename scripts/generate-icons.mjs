import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, "..", "public");
const sourceSvg = await readFile(resolve(publicDir, "icon.svg"));

const targets = [
  { name: "pwa-192x192.png", size: 192 },
  { name: "pwa-512x512.png", size: 512 },
  { name: "maskable-icon-512x512.png", size: 512, pad: 0.18 },
  { name: "apple-touch-icon.png", size: 180 },
  { name: "favicon-32x32.png", size: 32 },
  { name: "favicon-16x16.png", size: 16 },
];

for (const t of targets) {
  const inner = Math.round(t.size * (1 - (t.pad ?? 0) * 2));
  const img = sharp(sourceSvg, { density: 384 }).resize(inner, inner);

  let pipeline = img;
  if (t.pad) {
    const offset = Math.round((t.size - inner) / 2);
    pipeline = sharp({
      create: {
        width: t.size,
        height: t.size,
        channels: 4,
        background: { r: 255, g: 247, b: 236, alpha: 1 },
      },
    }).composite([{ input: await img.png().toBuffer(), top: offset, left: offset }]);
  }

  const buf = await pipeline.png().toBuffer();
  await writeFile(resolve(publicDir, t.name), buf);
  console.log(`✓ ${t.name} (${t.size}x${t.size})`);
}

// Favicon.ico — use the 32x32 PNG bytes; browsers accept PNG in .ico containers.
const favicon32 = await sharp(sourceSvg, { density: 384 }).resize(32, 32).png().toBuffer();
await writeFile(resolve(publicDir, "favicon.ico"), favicon32);
console.log("✓ favicon.ico (32x32)");
