import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { matrixColumns, matrixRows, matrixReferences } from "../src/data/erlang-rust-matrix.mjs";

const page = readFileSync(new URL("../src/pages/erlang-rust-oreslang.astro", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/styles/erlang-rust-matrix.css", import.meta.url), "utf8");
const comparisons = readFileSync(new URL("../src/pages/comparisons.astro", import.meta.url), "utf8");

const expectedFeatures = [
  "Type system", "Hot reloading in production", "Build system", "Borrow checking",
  "Garbage collection", "Soft real time", "Hard real time", "AOT vs JIT",
  "Usage in Lambdas / serverless", "Actor system", "Functional programming",
  "Algebraic data types (ADTs)", "Data-oriented programming", "GPUs",
  "Distributed systems", "Carrier-grade Linux", "WebSocket servers",
  "RTC signaling servers", "Top 5 use cases", "Stack traces",
  "High load: CPU, memory and profiling", "Concurrency model",
  "FFI, ABI and C integration", "Package managers and module systems",
];

test("four requested columns and all 24 unique requested dimensions render in order", () => {
  assert.deepEqual(matrixColumns.map(({ label }) => label), [
    "Erlang", "Rust", "Oreslang (direction)", "Other languages",
  ]);
  assert.deepEqual(matrixRows.map(({ feature }) => feature), expectedFeatures);
  assert.equal(new Set(matrixRows.map(({ id }) => id)).size, expectedFeatures.length);
  for (const row of matrixRows) {
    assert.match(row.id, /^[a-z0-9-]+$/u);
    assert.ok(["design", "research"].includes(row.status));
    for (const key of ["erlang", "rust", "oreslang", "others"]) {
      const value = row[key];
      assert.ok(Array.isArray(value) ? value.length > 0 && value.every((item) => item.length >= 25) : value.length >= 55,
        row.id + " missing meaningful " + key + " comparison");
    }
  }
});

test("top five use cases are exactly five per column and clearly qualify Oreslang", () => {
  const topFive = matrixRows.find(({ id }) => id === "top-five");
  assert.ok(topFive);
  for (const key of ["erlang", "rust", "oreslang", "others"]) {
    assert.equal(topFive[key].length, 5);
    assert.equal(new Set(topFive[key]).size, 5);
  }
  assert.ok(topFive.oreslang.every((useCase) => useCase.startsWith("Proposed:")));
});

test("comparisons are transparent about hard real-time and unverified Oreslang support", () => {
  assert.match(page, /not a claim that Oreslang already matches Erlang\/OTP or Rust in production/u);
  assert.match(page, /public.*feature snapshot/u);
  assert.match(page, /Soft real time is not hard real time/u);
  assert.match(page, /no head-to-head throughput, memory or CPU win is established|High-load performance needs a reproducible workload/u);
  assert.match(page, /not verified/u);
  assert.match(matrixRows.find(({ id }) => id === "garbage-collection").oreslang, /GraalVM.*managed GC/u);
  assert.match(matrixRows.find(({ id }) => id === "carrier-grade-linux").oreslang, /no CGL compliance/u);
  assert.match(matrixRows.find(({ id }) => id === "hard-real-time").oreslang, /Not certified/u);
  assert.match(matrixRows.find(({ id }) => id === "aot-jit").oreslang, /per backend/u);
});

test("matrix accessible on narrow viewports and discoverable from existing comparison route", () => {
  assert.match(page, /<table class="synthesis-table">/u);
  assert.match(page, /<caption>/u);
  assert.match(page, /scope="row"/u);
  assert.match(page, /scope="col"/u);
  assert.match(page, /role="region"[^>]+tabindex="0"/u);
  assert.match(page, /class="synthesis-scroll-hint"/u);
  assert.match(css, /overflow-x: auto/u);
  assert.match(css, /focus-visible/u);
  assert.match(css, /@media \(max-width: 650px\)/u);
  assert.match(comparisons, /href="\/erlang-rust-oreslang\/"/u);
});

test("sources include official Erlang/Rust, RT Linux, and local Oreslang caveats", () => {
  const urls = matrixReferences.map(({ url }) => url);
  assert.ok(matrixReferences.length >= 10);
  assert.equal(new Set(urls).size, urls.length);
  for (const url of urls) {
    assert.match(url, /^(?:https:\/\/|\/)/u);
    assert.ok(!/javascript:|data:/iu.test(url));
  }
  assert.ok(urls.some((url) => url.includes("erlang.org")));
  assert.ok(urls.some((url) => url.includes("doc.rust-lang.org")));
  assert.ok(urls.some((url) => url.includes("docs.kernel.org")));
  assert.ok(urls.includes("/language/"));
  assert.ok(urls.includes("/performance/"));
});
