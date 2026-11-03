import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { inflateSync, deflateSync } from "node:zlib";
import { createHash } from "node:crypto";
import { BYTE_COUNT, compareVisual, checkScreenshotPng } from "./visual-signatures.mjs";

const inventory = JSON.parse(readFileSync(new URL("./visual-baselines.json", import.meta.url), "utf8"));

test("visual baselines have exact-source provenance, including approved per-image refreshes", () => {
  assert.equal(inventory.version, 1);
  assert.equal(inventory.source.repository, "ores-truffle-oreslang/ores-truffle-oreslang.github.io");
  assert.equal(inventory.source.workflowRun, 38948068851);
  assert.equal(inventory.source.artifactId, 12067237575);
  assert.match(inventory.source.gitCommit, /^[0-9a-f]{40}$/u);
  assert.deepEqual(inventory.environment.snapshot, { width: 32, height: 24, viewportHeight: 900 });
  assert.equal(inventory.environment.playwright, "1.56.1");
  // Original seed remains intact for unaffected captures. Existing wordmark
  // review metadata applies to log-7; archive captures now have their own
  // reviewed source/artifact provenance after publication of log 009.
  const archiveKeys = ["chromium", "firefox", "webkit"].flatMap((engine) =>
    [375, 1440].map((width) => engine + "-" + width + "-archive.png")
  );
  const wordmarkKeys = ["chromium-375-log-7.png", "firefox-375-log-7.png", "webkit-375-log-7.png"];
  assert.deepEqual(Object.keys(inventory.reviewedOverrides).sort(),
    [...archiveKeys, ...wordmarkKeys].sort());
  for (const key of wordmarkKeys) {
    const reviewed = inventory.reviewedOverrides[key];
    assert.equal(reviewed.workflowRun, 41371319485);
    assert.equal(reviewed.artifactId, 13109317665);
    assert.equal(reviewed.gitCommit, "42707dd63bd61adf581b541987340329ff5a6152");
    assert.match(reviewed.reason, /AttoLang-wordmark/u);
  }
  const expectedArchiveShas = {
    "chromium-375-archive.png": "edf3c793b261bb0f4dc77a6d2a948e0f1ee69819b89c2f9948a30406db72317c",
    "chromium-1440-archive.png": "e510cf261e76cf09e348169c4e139f671dfdf120828250d5fc91220deadc3407",
    "firefox-375-archive.png": "db87d4b8ee6641edad79047815553c34f455fbfba170a52681d537af72bc6eb9",
    "firefox-1440-archive.png": "7fb518d311b02bb94cf30255f72a071bd9f43396913b635ab174957946d19ff9",
    "webkit-375-archive.png": "b078c99f2a0aadcc71dda35e5b78cb0a2e338045afd761127ab7ee62108a18bc",
    "webkit-1440-archive.png": "aadcfe1dabe92cb0f830c7ba66ed4ef15be406de97c41fddc377d1b7518b9118",
  };
  for (const key of archiveKeys) {
    const reviewed = inventory.reviewedOverrides[key];
    if (key.endsWith("-375-archive.png")) {
      assert.equal(reviewed.workflowRun, 41527679311);
      assert.equal(reviewed.artifactId, 13179614316);
      assert.equal(reviewed.gitCommit, "1ad6da0da775d66eabdb92a38a0be53753d850bb");
      assert.match(reviewed.reason, /correcting the browser test to restore the default closed menu state/u);
    } else {
      assert.equal(reviewed.workflowRun, 41371991760);
      assert.equal(reviewed.artifactId, 13109936045);
      assert.equal(reviewed.gitCommit, "6b0f6490eb362472ea9105ccdbc8da8270a6bb8d");
      assert.match(reviewed.reason, /Reviewed all six full-size archive screenshots/u);
    }
    assert.equal(inventory.images[key].pngSha256, expectedArchiveShas[key],
      "Archive screenshot hash must match the reviewed artifact");
  }
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
