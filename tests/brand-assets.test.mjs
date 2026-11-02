import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (p) => readFileSync(new URL("../" + p, import.meta.url), "utf8");

test("favicon is derived from the approved AttoLang lettering", () => {
  const logo = read("public/attolang-wordmark.svg");
  const favicon = read("public/favicon.svg");
  const path = logo.match(/d="([^"]+)"/u)?.[1];
  assert.ok(path, "Missing source wordmark path");
  assert.match(favicon, /viewBox="0 0 166 166"/u);
  assert.ok(favicon.includes(path.slice(path.indexOf("M21 75 "), path.indexOf("M1091 55 "))));
  assert.doesNotMatch(favicon, /#6b472f|#ff6a00|<script|<image|\bhref=/iu);
});

test("AttoLang social previews use a local PNG and absolute canonical URL", () => {
  const layout = read("src/layouts/BaseLayout.astro");
  assert.match(layout, /property="og:image" content=\{socialImage\}/u);
  assert.match(layout, /name="twitter:image" content=\{socialImage\}/u);
  assert.match(layout, /name="twitter:card" content="summary_large_image"/u);
  assert.match(layout, /new URL\("\/brand\/attolang-social\.png", Astro\.site\)/u);
  assert.match(layout, /property="og:image:width" content="1200"/u);
  assert.match(layout, /property="og:image:height" content="630"/u);
});

test("AttoLang migration note preserves compatibility names only in historical context", () => {
  const about = read("src/pages/about.astro");
  assert.match(about, /formerly known as Oreslang/u);
  const policy = read("docs/BRAND_IDENTITY.md");
  assert.match(policy, /Keep historical GitHub organization\/repository paths/u);
  assert.match(read("src/pages/brand.astro"), /attolang-black\.png/u);
  assert.match(read("README.md"), /brand assets/u);
});

test("raster brand assets are generated from the canonical SVG in the reproducible build", () => {
  const generator = read("scripts/build-brand-assets.mjs");
  const pkg = JSON.parse(read("package.json"));
  assert.match(pkg.scripts.build, /^node scripts\/build-brand-assets\.mjs && astro check && astro build$/u);
  assert.match(generator, /sharp\(Buffer\.from\(black\)\)/u);
  assert.match(generator, /sharp\(Buffer\.from\(white\)\)/u);
  assert.match(generator, /attolang-social\.png/u);
  assert.match(generator, /attolang-icon-180\.png/u);
});
