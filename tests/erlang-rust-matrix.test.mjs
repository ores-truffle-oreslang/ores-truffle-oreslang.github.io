import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { matrixColumns, matrixRows, matrixReferences } from "../src/data/erlang-rust-matrix.mjs";
import { matrixCategories, matrixRowAnnotations, matrixSourceCatalog } from "../src/data/erlang-rust-matrix-navigation.mjs";

const page = readFileSync(new URL("../src/pages/erlang-rust-oreslang.astro", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/styles/erlang-rust-matrix.css", import.meta.url), "utf8");
const comparisons = readFileSync(new URL("../src/pages/comparisons.astro", import.meta.url), "utf8");

const expectedFeatures = [
  "Type system", "Hot reloading in production", "Build system", "Borrow checking",
  "Memory safety", "Garbage collection", "32-bit pointers / compressed arena offsets", "Soft real time", "Hard real time", "AOT vs JIT",
  "Usage in Lambdas / serverless", "Mobile phones (Android / iOS)", "Desktop applications", "Actor system", "Functional programming",
  "Algebraic data types (ADTs)", "Data-oriented programming", "GPUs",
  "Distributed systems", "Carrier-grade Linux", "Embedded systems", "FPGA and ASIC integration", "WebSocket servers",
  "RTC signaling servers", "Top 5 use cases", "Stack traces",
  "High load: CPU, memory and profiling", "Concurrency model", "Non-blocking I/O by default",
  "FFI, ABI and C integration", "Package managers and module systems",
];

test("four requested columns and all 31 unique requested dimensions render in order", () => {
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
      assert.ok(Array.isArray(value) ? value.length > 0 && value.every((item) => item.length >= 15) : value.length >= 55,
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
  assert.match(matrixRows.find(({ id }) => id === "borrow-checking").oreslang, /rt mut borrow/u);
  assert.doesNotMatch(matrixRows.find(({ id }) => id === "borrow-checking").oreslang, /rt borrow mut/u);
  assert.match(page, /Research \/ not verified/u);
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

test("all 31 dimensions have safe, valid source pointers and exactly one category", () => {
  assert.equal(Object.keys(matrixRowAnnotations).length, matrixRows.length);
  const allowed = new Set(matrixCategories.map(({ id }) => id));
  assert.equal(allowed.size, matrixCategories.length);
  assert.ok(allowed.has("all"));
  assert.ok(Object.keys(matrixSourceCatalog).length >= 20);
  for (const row of matrixRows) {
    const annotation = matrixRowAnnotations[row.id];
    assert.ok(annotation, "missing annotations: " + row.id);
    assert.ok(allowed.has(annotation.category) && annotation.category !== "all");
    assert.ok(annotation.sources.length >= 2);
    assert.equal(new Set(annotation.sources).size, annotation.sources.length);
    assert.ok(annotation.sources.some((s) => s === "ores_features" || s === "ores_performance"));
    for (const sourceKey of annotation.sources) {
      const source = matrixSourceCatalog[sourceKey];
      assert.ok(source, "missing source key " + sourceKey);
      assert.ok(source.label.length > 10);
      assert.match(source.url, /^(?:https:\/\/[a-z0-9.-]+\/|\/)/u);
      assert.ok(!/[<>"']/u.test(source.url), "unsafe source URL: " + source.url);
    }
  }
});

test("matrix can be searched, linked to, printed and used without JS", () => {
  assert.match(page, /<input id="synthesis-search" type="search"/u);
  assert.match(page, /<select id="synthesis-category"/u);
  assert.match(page, /role="status" aria-live="polite"/u);
  assert.match(page, /data-category=\{matrixRowAnnotations\[row.id\].category\}/u);
  assert.match(page, /<th scope="row">/u);
  assert.ok(page.includes("href={`#${row.id}`}"), "feature anchor binding missing");
  assert.match(page, /<details class="synthesis-row-sources">/u);
  assert.match(page, /new URL\(window.location.href\)/u);
  assert.match(page, /window.addEventListener\("popstate", readUrl\)/u);
  assert.match(page, /search.addEventListener\("input"/u);
  assert.match(page, /reset.addEventListener\("click"/u);
  assert.match(page, /all rows and their source links remain visible without JavaScript/u);
  assert.match(css, /\.synthesis-table tbody tr\[hidden\] \{ display: none !important; \}/u);
  assert.match(css, /@media print/u);
});

test("performance benchmarking copy requires parity, overload and published raw evidence", () => {
  assert.match(page, /A fair high-load benchmark needs more than requests per second/u);
  for (const label of ["Workload parity", "CPU and memory", "Tail latency and overload", "Failure and recovery"]) {
    assert.ok(page.includes(label), "missing benchmarking guidance: " + label);
  }
  assert.match(page, /p99\.9/u);
  assert.match(page, /raw artifacts are reproducible/u);
  assert.match(page, /not published benchmark results/u);
});

test("new platform and safety comparisons accurately distinguish native pointers, offsets, and targets", () => {
  const row = (id) => matrixRows.find((item) => item.id === id);
  const expected = ["memory-safety", "compressed-addressing", "nonblocking-io", "embedded-systems", "fpga-asic", "mobile-phones", "desktop-apps"];
  assert.equal(matrixRows.length, 31);
  assert.equal(matrixRows.filter((item) => item.id === "carrier-grade-linux").length, 1);
  for (const id of expected) {
    assert.ok(row(id), "missing row " + id);
    assert.ok(matrixRowAnnotations[id], "missing row sources " + id);
    for (const column of ["erlang", "rust", "oreslang", "others"]) {
      assert.ok(row(id)[column].length >= 90, id + " too shallow in " + column);
    }
    assert.match(row(id).oreslang, /(?:design|target|research|goal|direction)/iu, id + " must be qualified");
  }
  assert.match(row("compressed-addressing").oreslang, /32-bit offsets|32-bit offset/iu);
  assert.match(row("compressed-addressing").oreslang, /4 GiB/u);
  assert.match(row("compressed-addressing").oreslang, /64-bit/u);
  assert.match(row("memory-safety").rust, /unsafe Rust/u);
  assert.match(row("nonblocking-io").rust, /often blocking/iu);
  assert.match(row("nonblocking-io").oreslang, /No universal non-blocking default/u);
  assert.match(row("embedded-systems").oreslang, /No validated microcontroller/u);
  assert.match(row("fpga-asic").oreslang, /LLVM native compilation alone does not generate circuits/u);
  assert.match(row("mobile-phones").oreslang, /No complete signed mobile app/u);
  assert.match(row("desktop-apps").oreslang, /No complete production desktop UI framework/u);
  assert.match(row("carrier-grade-linux").oreslang, /No independent CGL compliance/u);
});

test("new dimension counts derive from catalog and remain accessible", () => {
  assert.match(page, /\$\{matrixRows\.length\}-feature architecture matrix/u);
  assert.match(page, /\{matrixRows\.length\} technical dimensions/u);
  assert.match(page, /\{matrixRows\.length\} of \{matrixRows\.length\} dimensions shown/u);
  assert.match(page, /Compact addressing is not a 32-bit address-space guarantee/u);
  assert.match(page, /FPGA or ASIC circuitry/u);
});
