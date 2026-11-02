import assert from "node:assert/strict";

const site = "https://ores-truffle-oreslang.github.io";
const fetchPath = async (path, expectedType) => {
  const response = await fetch(site + path, {
    redirect: "error",
    signal: AbortSignal.timeout(15000),
    headers: { "Cache-Control": "no-cache" },
  });
  assert.equal(response.status, 200, "Non-200 HTTP response for " + path);
  assert.ok(response.headers.get("content-type")?.includes(expectedType),
    "Wrong content type for " + path + ": " + response.headers.get("content-type"));
  return new Uint8Array(await response.arrayBuffer());
};
const html = new TextDecoder().decode(await fetchPath("/", "text/html"));
assert.match(html, /AttoLang/u);
assert.match(html, /attolang-wordmark\.svg/u);
assert.match(html, /social-preview\.png/u);
assert.match(html, /og:image:type" content="image\/png"/u);
const log9 = new TextDecoder().decode(await fetchPath("/logs/9/", "text/html"));
assert.match(log9, /What AttoLang learns from Microsoft Orleans/u);
const rss = new TextDecoder().decode(await fetchPath("/rss.xml", "xml"));
assert.match(rss, /AttoLang engineering logs/u);
assert.equal([...rss.matchAll(/<item>/gu)].length, 9, "Expected nine live RSS items");
const png = await fetchPath("/social-preview.png", "image/png");
assert.ok(png.length > 12000 && png.length < 3_000_000);
assert.deepEqual([...png.slice(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
assert.equal(view.getUint32(16), 1200);
assert.equal(view.getUint32(20), 630);
const favicon = new TextDecoder().decode(await fetchPath("/favicon.svg", "svg"));
assert.match(favicon, /AttoLang favicon/u);
assert.doesNotMatch(favicon, /#6b472f|#ff6a00/iu);
console.log("Verified live AttoLang home, nine-log RSS, log 9, PNG social card and favicon");
