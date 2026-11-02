import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

// Render from the approved wordmark vector, not a replacement font or network asset.
const root = new URL("../public/", import.meta.url);
const assets = new URL("../public/brand/", import.meta.url);
await mkdir(fileURLToPath(assets), { recursive: true });

const read = (path) => readFile(new URL(path, root), "utf8");
const black = await read("attolang-wordmark.svg");
const white = await read("attolang-wordmark-light.svg");
const pathData = black.match(/<path fill="#000" fill-rule="evenodd" d="([^"]+)"/u)?.[1];

assert.ok(pathData?.startsWith("M787 55 "), "Unknown AttoLang logo geometry");
assert.equal(white, black.replace('fill="#000"', 'fill="#fff"'),
  "Light and dark wordmarks must have identical geometry");
assert.doesNotMatch(black + white, /<script|<image|<foreignObject|\bhref\s*=/iu,
  "Wordmark SVG must not contain external resources");

const iconPath = pathData.slice(pathData.indexOf("M21 75 "), pathData.indexOf("M1091 55 "));
assert.ok(iconPath.startsWith("M21 75 ") && iconPath.includes("M123 135 "),
  "Failed to select the original first-letter glyph");
const favicon = [
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 166 166">',
  '<rect width="166" height="166" rx="32" fill="#fff"/>',
  '<path transform="translate(0 -51)" fill="#000" fill-rule="evenodd" d="',
  iconPath, '"/></svg>',
].join("");
const committedIcon = await read("favicon.svg");
assert.equal(committedIcon.trim(), favicon, "Favicon no longer matches the approved wordmark");

const social = [
  '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">',
  '<rect width="1200" height="630" fill="#080b0e"/>',
  '<path fill="#fff" fill-rule="evenodd" transform="translate(142 138) scale(.83)" d="',
  pathData, '"/>',
  '<text x="600" y="445" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="32" fill="#e2f0e7">',
  'Isolation-first systems programming</text>',
  '<path d="M145 503H1055" stroke="#629376" stroke-width="2"/>',
  '<text x="600" y="550" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="22" fill="#9cb2a3">',
  'ores-truffle-oreslang.github.io</text>',
  '</svg>',
].join("");

await Promise.all([
  sharp(Buffer.from(black)).resize(1100, 283, { fit: "contain" })
    .png({ compressionLevel: 9 }).toFile(fileURLToPath(new URL("attolang-black.png", assets))),
  sharp(Buffer.from(white)).resize(1100, 283, { fit: "contain" })
    .png({ compressionLevel: 9 }).toFile(fileURLToPath(new URL("attolang-white.png", assets))),
  sharp(Buffer.from(social))
    .png({ compressionLevel: 9 }).toFile(fileURLToPath(new URL("attolang-social.png", assets))),
  sharp(Buffer.from(favicon)).resize(180, 180)
    .png({ compressionLevel: 9 }).toFile(fileURLToPath(new URL("attolang-icon-180.png", assets))),
  writeFile(new URL("attolang-social.svg", assets), social + "\n"),
]);

console.log("Generated self-contained AttoLang brand assets (SVG/PNG, social, icon)");
