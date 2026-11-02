import assert from "node:assert/strict";

const origin = "https://ores-truffle-oreslang.github.io";
const get = async (path, type) => {
  const response = await fetch(origin + path, {
    redirect: "error",
    signal: AbortSignal.timeout(15000),
    headers: { "Cache-Control": "no-cache" },
  });
  assert.equal(response.status, 200, "HTTP status for " + path);
  assert.ok(response.headers.get("content-type")?.includes(type),
    path + " content-type: " + response.headers.get("content-type"));
  return new Uint8Array(await response.arrayBuffer());
};
const read = (buffer) => new TextDecoder().decode(buffer);
const home = read(await get("/", "text/html"));
assert.match(home, /AttoLang/u);
assert.match(home, /attolang-wordmark\.svg/u);
assert.match(home, /og:image" content="https:\/\/ores-truffle-oreslang\.github\.io\/brand\/attolang-social\.png"/u);
const brand = read(await get("/brand/", "text/html"));
assert.match(brand, /AttoLang/u);
const log9 = read(await get("/logs/9/", "text/html"));
assert.match(log9, /What AttoLang learns from Microsoft Orleans/u);
const rss = read(await get("/rss.xml", "xml"));
assert.match(rss, /AttoLang engineering logs/u);
assert.equal([...rss.matchAll(/<item>/gu)].length, 9, "Live RSS must list nine articles");
const png = await get("/brand/attolang-social.png", "image/png");
assert.ok(png.length > 1000 && png.length < 2_000_000, "Social card size");
assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
assert.equal(view.getUint32(16), 1200);
assert.equal(view.getUint32(20), 630);
const icon = await get("/brand/attolang-icon-180.png", "image/png");
assert.deepEqual([...icon.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
const iview = new DataView(icon.buffer, icon.byteOffset, icon.byteLength);
assert.equal(iview.getUint32(16), 180);
assert.equal(iview.getUint32(20), 180);
const favicon = read(await get("/favicon.svg", "svg"));
assert.match(favicon, /AttoLang favicon/u);
assert.doesNotMatch(favicon, /#6b472f|#ff6a00/iu);
console.log("Verified live AttoLang Pages: homepage, brand downloads, log nine, RSS, raster art and favicon");
