import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (file) => readFileSync(join(root, file), "utf8");
const inventory = JSON.parse(read("src/data/engineering-log-examples.json"));
const entries = inventory.examples;

test("every rendered or highlighted blog sample is accounted for in an evidence inventory", () => {
  assert.equal(inventory.schemaVersion, 1);
  assert.equal(entries.length, 16);
  assert.equal(new Set(entries.map((x) => x.id)).size, entries.length);
  for (let log = 1; log <= 7; log++) {
    const matching = entries.filter((x) => x.log === log);
    const source = log <= 5
      ? "src/components/Log" + log + "Content.astro"
      : "src/pages/logs/" + log + ".astro";
    const fragments = [...read(source).matchAll(/<(?:pre|OresCode)\b/gu)];
    assert.equal(matching.length, fragments.length, "Log " + log + " has unreviewed examples");
    assert.deepEqual(matching.map((x) => x.ordinal), fragments.map((_, index) => index + 1));
    for (const entry of matching) {
      assert.equal(entry.source, source);
      assert.ok(entry.kind && entry.note.length >= 20);
      assert.ok(["illustrative", "experimental", "verified"].includes(entry.status));
      assert.equal(typeof entry.compilerVerified, "boolean");
      if (entry.status === "verified" || entry.compilerVerified) {
        assert.equal(entry.status, "verified");
        assert.ok(/^[0-9a-f]{40}$/u.test(entry.compilerCommit ?? ""), "No pinned compiler commit");
        assert.ok(/^https:\/\/github\.com\//u.test(entry.verificationRun ?? ""), "No CI evidence URL");
      } else {
        assert.equal(entry.compilerVerified, false);
        assert.equal(entry.compilerCommit, null);
        assert.equal(entry.verificationRun, null);
      }
    }
  }
});

test("production blog prose must not imply unchecked examples were compiler-verified", () => {
  const source = read("src/components/Log4Content.astro");
  assert.doesNotMatch(source, /formatter-verified Oreslang/u);
  const llvm = read("src/components/Log1Content.astro");
  assert.match(llvm, /proposed syntax, not implemented Oreslang/u);
  const actor = read("src/pages/logs/6.astro");
  assert.match(actor, /They do not calculate derivatives/u);
});
