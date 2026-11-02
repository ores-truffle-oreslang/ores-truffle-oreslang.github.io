import { chromium } from "playwright";
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const source = new URL("../public/social-preview.svg", import.meta.url);
const target = new URL("../public/social-preview.png", import.meta.url);
const svg = await readFile(source, "utf8");

// Never grant the renderer network access or allow scriptable/external SVG content.
assert.match(svg, /viewBox="0 0 1200 630"/u);
assert.match(svg, /AttoLang/u);
assert.doesNotMatch(svg, /<script\b|<foreignObject\b|<image\b|\b(?:xlink:)?href\s*=|\burl\s*\(/iu);
const imageData = "data:image/svg+xml;base64," + Buffer.from(svg, "utf8").toString("base64");
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
    colorScheme: "dark",
    reducedMotion: "reduce",
  });
  await page.route(/^https?:/u, (route) => route.abort("blockedbyclient"));
  await page.setContent(
    '<!doctype html><html><head><meta charset="UTF-8"><style>' +
    'html,body{width:1200px;height:630px;margin:0;overflow:hidden;background:#080b0e}' +
    'img{display:block;width:1200px;height:630px}</style></head>' +
    '<body><img src="' + imageData + '" alt="AttoLang social preview"></body></html>',
    { waitUntil: "load" }
  );
  await page.locator("img").evaluate((element) => element.decode());
  const png = await page.screenshot({ type: "png", animations: "disabled" });
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(png.readUInt32BE(16), 1200);
  assert.equal(png.readUInt32BE(20), 630);
  assert.ok(png.length > 12000 && png.length < 3_000_000, "PNG unexpectedly small or large");
  await writeFile(target, png);
  process.stdout.write("Rendered AttoLang social-preview.png (1200x630, " + png.length + " bytes)\n");
} finally {
  await browser.close();
}
