import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";
import { BYTE_COUNT, compareVisual } from "./visual-signatures.mjs";

const inventory = JSON.parse(readFileSync(new URL("./visual-baselines.json", import.meta.url), "utf8"));

test("visual baselines are pinned to one reviewed exact-source workflow artifact", () => {
  assert.equal(inventory.version, 1);
  assert.equal(inventory.source.repository, "ores-truffle-oreslang/ores-truffle-oreslang.github.io");
  assert.equal(inventory.source.workflowRun, 38661442077);
  assert.equal(inventory.source.artifactId, 11938553812);
  assert.match(inventory.source.gitCommit, /^[0-9a-f]{40}$/u);
  assert.deepEqual(inventory.environment.snapshot, { width: 32, height: 24, viewportHeight: 900 });
  assert.equal(inventory.environment.playwright, "1.56.1");
  const files = Object.keys(inventory.images);
  assert.equal(files.length, 18);
  for (const engine of ["chromium", "firefox", "webkit"]) {
    for (const width of [375, 1440]) {
      for (const route of ["archive", "log-6", "log-7"]) {
        const key = engine + "-" + width + "-" + route + ".png";
        const entry = inventory.images[key];
        assert.ok(entry, "Missing visual baseline " + key);
        assert.match(entry.pngSha256, /^[0-9a-f]{64}$/u);
        assert.equal(inflateSync(Buffer.from(entry.sampleZlibBase64, "base64")).length,
          BYTE_COUNT, "Malformed visual baseline for " + key);
      }
    }
  }
});

test("large or localized color changes fail visual comparison without reapproval", () => {
  const entry = inventory.images["chromium-375-log-6.png"];
  const original = inflateSync(Buffer.from(entry.sampleZlibBase64, "base64"));
  const changed = Buffer.from(original);
  for (let cell = 0; cell < 36; cell++) {
    for (let channel = 0; channel < 3; channel++) {
      changed[cell * 3 + channel] = changed[cell * 3 + channel] > 128 ? 0 : 255;
    }
  }
  assert.throws(() => compareVisual("chromium-375-log-6.png",
    Buffer.from("changed-image"), changed, entry), /visual regression/u);
  assert.doesNotThrow(() => compareVisual("chromium-375-log-6.png",
    Buffer.from("different-PNG-encoding"), original, entry));
});
