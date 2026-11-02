import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
test("Pages deployment verifies the complete published catalog, not only seven logs", () => {
  const deploy = source(".github/workflows/deploy.yml");
  assert.match(deploy, /npm run test:blogs:build/u);
  assert.doesNotMatch(deploy, /for n in 1 2 3 4 5 6 7(?:;|\s)/u);
  for (const image of ["attolang-social.png","attolang-icon-180.png","attolang-black.png","attolang-white.png"]) {
    assert.ok(deploy.includes("dist/brand/" + image), "Missing production asset gate: " + image);
  }
  assert.match(deploy, /node scripts\/verify-live-pages\.mjs/u);
  assert.match(deploy, /persist-credentials: false/u);
});
test("single canonical renderer and exact PNG social metadata are retained", () => {
  const pkg = JSON.parse(source("package.json"));
  assert.match(pkg.scripts.build, /node scripts\/build-brand-assets\.mjs/u);
  const script = source("scripts/build-brand-assets.mjs");
  assert.match(script, /attolang-social\.png/u);
  assert.match(script, /sharp\(Buffer\.from\(social\)\)/u);
  const layout = source("src/layouts/BaseLayout.astro");
  assert.match(layout, /brand\/attolang-social\.png/u);
  assert.match(layout, /content="image\/png"/u);
});
