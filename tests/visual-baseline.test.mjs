import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { inflateSync, deflateSync } from "node:zlib";
import { createHash } from "node:crypto";
import { BYTE_COUNT, compareVisual, checkScreenshotPng } from "./visual-signatures.mjs";

const inventory = JSON.parse(readFileSync(new URL("./visual-baselines.json", import.meta.url), "utf8"));

test("visual baselines are pinned to one reviewed exact-source workflow artifact", () => {
  assert.equal(inventory.version, 1);
  assert.equal(inventory.source.repository, "ores-truffle-oreslang/ores-truffle-oreslang.github.io");
  assert.equal(inventory.source.workflowRun, 38948068851);
  assert.equal(inventory.source.artifactId, 12067237575);
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

test("visual verification rejects corrupt PNG headers, mismatched dimensions and huge screenshots", () => {
  const png = Buffer.alloc(33);
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]).copy(png);
  png.write("IHDR", 12, "ascii");
  png.writeUInt32BE(375, 16);
  png.writeUInt32BE(900, 20);
  png[24] = 8;
  png[25] = 6;
  assert.doesNotThrow(() => checkScreenshotPng("fixture", png, 375));
  assert.throws(() => checkScreenshotPng("fixture", png, 1440), /screenshot width/u);
  assert.throws(() => checkScreenshotPng("fixture", png, 375, 700), /screenshot height/u);
  const badMagic = Buffer.from(png);
  badMagic[1] = 0;
  assert.throws(() => checkScreenshotPng("fixture", badMagic, 375), /PNG magic/u);
  const badType = Buffer.from(png);
  badType[25] = 0;
  assert.throws(() => checkScreenshotPng("fixture", badType, 375), /color type/u);
  assert.throws(() => checkScreenshotPng("fixture", Buffer.alloc(5_000_000), 375), /PNG byte length/u);
});

test("matching PNG SHA cannot bypass mismatched or corrupt perceptual signature", () => {
  const screenshot = Buffer.from("approved-image");
  const pngSha256 = createHash("sha256").update(screenshot).digest("hex");
  const zeros = Buffer.alloc(BYTE_COUNT);
  const image = { pngSha256, sampleZlibBase64: deflateSync(zeros).toString("base64") };
  assert.doesNotThrow(() => compareVisual("fixture", screenshot, zeros, image));
  const changed = Buffer.from(zeros);
  changed[0] = 255;
  assert.throws(() => compareVisual("fixture", screenshot, changed, image), /signature differs/u);
  const oversized = { pngSha256, sampleZlibBase64: deflateSync(Buffer.alloc(BYTE_COUNT + 512)).toString("base64") };
  assert.throws(() => compareVisual("fixture", screenshot, zeros, oversized));
  assert.throws(() => compareVisual("fixture", screenshot, Buffer.alloc(10), image),
    /normalized pixel buffer/u);
});
