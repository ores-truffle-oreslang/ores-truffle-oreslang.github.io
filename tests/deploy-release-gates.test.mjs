import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = (name) => readFileSync(new URL("../" + name, import.meta.url), "utf8");

test("deployment executes the complete nine-log build contract, not a truncated historical list", () => {
  const deploy = source(".github/workflows/deploy.yml");
  assert.match(deploy, /npm run test:blogs:build/u);
  assert.doesNotMatch(deploy, /for n in 1 2 3 4 5 6 7(?:;|\s)/u);
  assert.match(deploy, /test -s dist\/social-preview\.png/u);
  assert.match(deploy, /node scripts\/verify-live-pages\.mjs/u);
});
test("both CI paths render the PNG before checking the build", () => {
  for (const path of [".github/workflows/deploy.yml", ".github/workflows/validate-site.yml"]) {
    const workflow = source(path);
    assert.ok(workflow.indexOf("npx playwright install --with-deps chromium") >= 0);
    assert.ok(workflow.indexOf("npx playwright install --with-deps chromium") < workflow.indexOf("npm run build"),
      "Chromium must be provisioned before build: " + path);
  }
  const pkg = JSON.parse(source("package.json"));
  assert.match(pkg.scripts.build, /^node scripts\/render-social-preview\.mjs && astro check && astro build$/u);
});
test("published metadata uses raster social preview with SVG retained as source", () => {
  const layout = source("src/layouts/BaseLayout.astro");
  assert.match(layout, /social-preview\.png/u);
  assert.match(layout, /image\/png/u);
  assert.match(source("public/social-preview.svg"), /AttoLang/u);
});
