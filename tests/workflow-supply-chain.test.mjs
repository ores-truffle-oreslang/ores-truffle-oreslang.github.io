import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const read = (path) => readFileSync(join(process.cwd(), path), "utf8");
const files = [
  ".github/workflows/validate-site.yml",
  ".github/workflows/deploy.yml",
  ".github/workflows/blog-quality.yml",
];
const manifest = JSON.parse(read("package.json"));
const lock = JSON.parse(read("package-lock.json"));

test("locked dependency graph includes the exact toolchain for blog CI", () => {
  assert.equal(lock.lockfileVersion, 3);
  assert.deepEqual(lock.packages[""].dependencies, manifest.dependencies);
  assert.deepEqual(lock.packages[""].devDependencies, manifest.devDependencies);
  assert.ok(Object.keys(lock.packages).length > 450);
  for (const [name, version] of Object.entries({
    astro: "7.3.6",
    playwright: "1.56.1",
    lighthouse: "12.8.2",
  })) {
    assert.equal(lock.packages["node_modules/" + name].version, version);
  }
  for (const [location, entry] of Object.entries(lock.packages)) {
    if (location && entry.resolved?.startsWith("https://registry.npmjs.org/")) {
      assert.match(entry.integrity ?? "", /^sha512-/u, location + " missing integrity");
    }
  }
});

for (const file of files) {
  test(file + " pins every GitHub Action by immutable SHA", () => {
    const yml = read(file);
    const actions = [...yml.matchAll(/^\s*uses:\s*([^\s#]+)/gmu)].map((m) => m[1]);
    assert.ok(actions.length >= 2);
    for (const action of actions) {
      assert.match(action, /^[\w.-]+\/[\w.-]+@[0-9a-f]{40}$/u, "Unpinned Action: " + action);
    }
    assert.doesNotMatch(yml, /\brun:\s*npm install\b/u);
    assert.match(yml, /\brun:\s*npm ci --no-fund/u);
    assert.match(yml, /persist-credentials: false/u);
  });
}

test("deployment uses least privilege; CI has read-only repository access", () => {
  const deploy = read(".github/workflows/deploy.yml");
  const validation = read(".github/workflows/validate-site.yml");
  assert.match(deploy, /permissions:\s*\n\s*contents: read/u);
  assert.match(deploy, /deploy:\s*\n\s*permissions:\s*\n\s*pages: write\s*\n\s*id-token: write/u);
  assert.match(validation, /permissions:\s*\n\s*contents: read/u);
  assert.match(validation, /test:blogs:browser/u);
  assert.match(validation, /test:lighthouse/u);
  assert.match(validation, /chromium firefox webkit/u);
  assert.match(deploy, /npm audit --omit=dev --audit-level=high/u);
  assert.match(validation, /npm audit --omit=dev --audit-level=high/u);
  assert.ok(!existsSync(join(process.cwd(), ".github/workflows/lockfile-bootstrap.yml")), "Bootstrap must not be shipped");
});
