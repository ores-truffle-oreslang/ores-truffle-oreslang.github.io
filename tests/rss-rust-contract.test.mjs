import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = p => readFileSync(new URL("../" + p, import.meta.url), "utf8");
test("RSS validation uses Rust XML and RFC-2822 parsers instead of Python", () => {
  const scripts = JSON.parse(read("package.json")).scripts;
  assert.match(scripts["test:rss:build"], /cargo test --manifest-path tools\/rss-validator\/Cargo\.toml/u);
  assert.match(scripts["test:rss:build"], /cargo run --manifest-path tools\/rss-validator\/Cargo\.toml/u);
  assert.doesNotMatch(scripts["test:rss:build"], /python/u);
  assert.match(read("tools/rss-validator/Cargo.toml"), /roxmltree = "=0\.21\.1"/u);
  const code = read("tools/rss-validator/src/main.rs");
  for (const term of ["Document::parse","parse_from_rfc2822","HashSet","Missing sitemap URL"]) {
    assert.ok(code.includes(term), "Required validation: " + term);
  }
  const rustTests = read("tools/rss-validator/src/tests.rs");
  for (const testName of ["valid_feed","malformed_xml","invalid_escaping","bad_publication_date","wrong_author_namespace","missing_sitemap_entry"]) {
    assert.ok(rustTests.includes(testName), "Missing Rust regression case " + testName);
  }
});
test("push and PR workflows execute Rust validation with pinned toolchain", () => {
  for (const file of [".github/workflows/deploy.yml",".github/workflows/validate-site.yml"]) {
    const content=read(file);
    const rust=content.indexOf("dtolnay/rust-toolchain@686976e191b89faba57d3206551f0f330d8cb249");
    const test=content.indexOf("npm run test:rss:build");
    assert.ok(rust >= 0 && test > rust, "Rust setup before validator: " + file);
  }
  assert.match(read(".github/workflows/validate-site.yml"), /"tools\/\*\*"/u);
});
