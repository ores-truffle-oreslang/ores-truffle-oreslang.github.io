import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const showcase = read("../src/pages/stateful-applications.astro");
const home = read("../src/pages/index.astro");
const nav = read("../src/components/SiteNav.astro");
const comparison = read("../src/pages/erlang-rust-oreslang.astro");
const performance = read("../src/pages/performance.astro");

test("stateful applications are a first-class page reachable from navigation and the homepage", () => {
  assert.ok(showcase.includes('title="Stateful Applications with AttoLang'));
  assert.ok(nav.includes('{ label: "stateful apps", href: "/stateful-applications/" }'));
  assert.ok(home.includes('href="/stateful-applications/"'));
  assert.ok(comparison.includes('href="/stateful-applications/"'));
  assert.ok(performance.includes('href="/stateful-applications/"'));
});

test("showcase covers the stateful application types in the AttoLang proposition", () => {
  for (const concept of [
    "WebSocket servers", "gaming backends", "Interactive UIs",
    "Distributed state machines", "Message queues and streams", "Development servers",
    "stateless REST APIs", "Microsoft Orleans"
  ]) {
    assert.ok(showcase.toLowerCase().includes(concept.toLowerCase()), "showcase missing " + concept);
  }
});

test("showcase explains persistent actors, typed messaging, supervision, and hot upgrades", () => {
  for (const concept of [
    "Persistent actors", "typed messages", "Channels and selection",
    "Pub-sub and actor groups", "Bounded flow", "Supervised actor groups",
    "restart and recovery policies", "stable actor identity", "roll back",
    "generation-aware hot upgrades", "native binaries", "zero GC"
  ]) {
    assert.ok(showcase.toLowerCase().includes(concept.toLowerCase()), "showcase missing " + concept);
  }
  assert.match(showcase, /aria-label="Persistent actor request lifecycle"/u);
  assert.match(showcase, /aria-label="Hot upgrade lifecycle"/u);
});

test("comparison and performance openings share the direct stateful-first proposition", () => {
  const comparisonHero = comparison.slice(0, comparison.indexOf('<section class="page-body'));
  const performanceHero = performance.slice(0, performance.indexOf('<div class="page-body'));
  for (const copy of [comparisonHero, performanceHero]) {
    assert.match(copy, /performance ambition is to exceed Erlang's throughput/iu);
    assert.match(copy, /10× speed and one-tenth compute figures are design targets, not measured results/iu);
    assert.match(copy, /no controlled, like-for-like Erlang comparison establishes them/iu);
    assert.match(copy, /type and memory safety goals/iu);
    assert.match(copy, /full AOT compilation/iu);
    assert.match(copy, /native binaries/iu);
    assert.match(copy, /zero-GC execution/iu);
    assert.match(copy, /fault-tolerant actors/iu);
    assert.match(copy, /better hot upgrades/iu);
    assert.doesNotMatch(copy, /We can deliver/iu);
  }
});
