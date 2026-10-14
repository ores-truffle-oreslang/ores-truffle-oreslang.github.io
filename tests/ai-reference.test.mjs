import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const load = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const page = load("../src/pages/language/index.astro");
const reference = load("../public/language/draft-2026-10-14/reference.md");
const guide = load("../public/language/draft-2026-10-14/agent-guide.md");
const matrix = JSON.parse(load("../public/language/draft-2026-10-14/features.json"));
const llms = load("../public/llms.txt");

test("Public reference is discoverable but fails closed on compiler claims", () => {
  assert.ok(page.includes("0 in the public index"));
  assert.ok(page.includes("Draft, not normative"));
  assert.ok(page.includes("/language/draft-2026-10-14/reference.md"));
  assert.ok(page.includes("/language/draft-2026-10-14/features.json"));
  assert.ok(page.includes("/language/draft-2026-10-14/agent-guide.md"));
  assert.ok(llms.includes("language/draft-2026-10-14/reference.md"));
  assert.ok(llms.includes("not a released language specification"));
});

test("Machine-readable versioned matrix never invents backend support", () => {
  assert.equal(matrix.schema_version, 1);
  assert.equal(matrix.reference_id, "draft-2026-10-14");
  assert.equal(matrix.status, "documentation-draft");
  assert.equal(matrix.normative, false);
  assert.equal(matrix.release_tag, null);
  assert.equal(matrix.examples.known_sources, 11);
  assert.equal(matrix.examples.public_verified_sources, 0);
  assert.match(matrix.examples.source_commit, /^[a-f0-9]{40}$/);
  assert.ok(matrix.features.length >= 10);
  const ids = new Set();
  for (const feature of matrix.features) {
    assert.ok(!ids.has(feature.id), "duplicate feature " + feature.id);
    ids.add(feature.id);
    assert.equal(feature.design_status, "described");
    assert.deepEqual(Object.keys(feature.support).sort(), [...matrix.backend_keys].sort());
    for (const backend of matrix.backend_keys) {
      assert.equal(feature.support[backend], "not-verified");
    }
  }
});

test("Agent guide and public reference identify source/evidence boundaries", () => {
  for (const token of ["DOCUMENTATION DRAFT", "not a released", "Git blob hash", "not-run",
    "historical", "backend", "compiler", "private repositories"]) {
    assert.ok(reference.toLowerCase().includes(token.toLowerCase()), "missing " + token);
  }
  for (const token of ["not an installed skill", "compiler version", "not-verified",
    "not-run", "untrusted data", "no claim"]) {
    assert.ok(guide.toLowerCase().includes(token.toLowerCase()), "missing " + token);
  }
});
