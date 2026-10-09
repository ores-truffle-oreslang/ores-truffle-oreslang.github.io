import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (name) => readFileSync(new URL(name, import.meta.url), "utf8");
const home = read("../src/pages/index.astro");
const nav = read("../src/components/SiteNav.astro");
const layout = read("../src/layouts/BaseLayout.astro");
const how = read("../src/pages/how-it-works.astro");
const perf = read("../src/pages/performance.astro");
const applicationAreas = read("../src/pages/problem-spaces.astro");
const css = read("../src/styles/technical.css");

test("home copy names both compilation backends and fixes cooperative scheduling title", () => {
  const intro = home.indexOf("A language for actor-based systems");
  const platforms = home.indexOf('class="hero-platforms"');
  const identity = home.indexOf('class="hero-tldr"');
  assert.ok(intro !== -1 && platforms > intro && identity > platforms);
  assert.ok(home.includes("Built for <strong>GraalVM</strong> and <strong>LLVM</strong>"));
  assert.ok(home.includes("<h3>Cooperative scheduling + scheduling un-cooperative code</h3>"));
  assert.ok(!home.includes("<h3>Scheduling code that will not yield</h3>"));
  assert.ok(css.includes(".hero-platforms strong { color: var(--orange)"));
});

test("both pages are reachable through shared desktop and mobile navigation", () => {
  for (const [label,href] of [["how it works", "/how-it-works/"],["performance", "/performance/"]]) {
    assert.ok(nav.includes('label: "' + label + '", href: "' + href + '"'));
  }
  assert.ok(nav.includes('{links.map((link) => <a href={link.href}>{link.label}</a>)}'));
  assert.ok(layout.includes('import "../styles/technical.css"'));
  assert.ok(how.includes('import BaseLayout from "../layouts/BaseLayout.astro"'));
  assert.ok(perf.includes('import BaseLayout from "../layouts/BaseLayout.astro"'));
});

test("OresVM technical explanation includes all requested scheduling and actor paths", () => {
  for (const term of ["OresVM", "AOT", "JIT", "hybrid", "<code>await</code>", "<code>select</code>",
    "<code>rt cooperate</code>", "for", "loop", "Shared", "Isolated / private", "Untrusted", "Hungry"]) {
    assert.ok(how.includes(term), "missing " + term);
  }
  assert.ok(how.includes("safepoint"));
  assert.ok(how.includes("not automatically"));
  assert.ok(how.includes("not yet general guest-code AOT lowering"));
  assert.ok(how.includes("not independent GC heaps") || how.includes("not independent GC heaps."));
  assert.ok(how.includes("experimental"));
  assert.ok(how.includes("Dedicated") || how.includes("dedicated"));
  assert.ok(how.includes("runtime/actor-physical-boundaries.md"));
});

test("performance page covers six auditable suites and never invents results", () => {
  assert.equal((perf.match(/number: "0[1-6]"/g) || []).length, 6);
  assert.equal((perf.match(/rows: \[/g) || []).length, 6);
  assert.equal((perf.match(/"No verified Ores(?:lang|VM) run"/g) || []).length, 18);
  for (const id of ["http-plaintext", "http-json", "http-routing", "http-database",
    "actor-mailbox", "scheduling-and-startup"]) {
    assert.ok(perf.includes('id: "' + id + '"'), "missing suite " + id);
  }
  assert.ok(perf.includes("wrk2"));
  assert.ok(perf.includes("TechEmpower"));
  assert.ok(perf.includes("source revisions, commands and raw outputs"));
  assert.ok(perf.includes("awaiting audited Oreslang runs"));
  assert.ok(perf.includes('class="tech-table"'));
  assert.ok(perf.includes('role="region" tabindex="0"'));
  assert.ok(css.includes("overflow-x: auto"));
  assert.ok(css.includes("@media (max-width: 580px)"));
});

test("Application Areas title is consistent on home, destination, and navigation", () => {
  assert.ok(home.includes('title="Application Areas" href="/problem-spaces/"'));
  assert.ok(applicationAreas.includes("<h1>Application Areas</h1>"));
  assert.ok(nav.includes('label: "application areas", href: hrefFor("problem-spaces")'));
  assert.ok(!home.includes('title="Where Oreslang is meant to matter"'));
});
