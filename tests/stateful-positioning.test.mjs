import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const home = readFileSync(new URL("../src/pages/index.astro", import.meta.url), "utf8");
const about = readFileSync(new URL("../src/pages/about.astro", import.meta.url), "utf8");

test("homepage leads with the stateful-applications motivation and core influences", () => {
  for (const concept of [
    "Stateless REST APIs", "WebSocket servers", "gaming backends",
    "interactive UIs", "distributed state machines", "message queues",
    "development servers", "Erlang", "Rust", "Microsoft Orleans",
    "fault-tolerant actors", "hot upgrades"
  ]) {
    assert.ok(home.includes(concept), "homepage missing " + concept);
  }
  assert.ok(home.indexOf('id="stateful-applications"') < home.indexOf('id="about"'));
  assert.ok(home.includes('href="/performance/"'));
  assert.ok(home.includes('href="/language/"'));
});

test("About page explains language influences, native goals, and both name meanings", () => {
  for (const concept of [
    "WebSocket servers", "gaming backends", "interactive UIs",
    "state machines for distributed coordination", "message queues",
    "development", "Erlang", "Rust", "Microsoft Orleans",
    "ahead-of-time (AOT)", "native binaries", "fault tolerance",
    "hot upgrades", "Italian", "Japanese", "attō", "圧倒"
  ]) {
    assert.ok(about.includes(concept), "About missing " + concept);
  }
  assert.ok(about.includes("AttoLang was formerly known as Oreslang."));
});

test("performance and zero-GC goals remain explicitly unverified and scoped", () => {
  assert.match(home, /more than <strong>10× Erlang's speed<\/strong>/u);
  assert.match(home, /one-tenth the compute/u);
  assert.match(home, /not measured or independently verified results/u);
  assert.match(about, /more than 10× Erlang's speed/u);
  assert.match(about, /not an established benchmark result/u);
  assert.match(home, /zero tracing GC for LLVM-native workloads/u);
  assert.match(about, /zero tracing garbage collection in LLVM-native execution/u);
  assert.ok(home.includes("Support and verification differ by backend"));
  assert.ok(about.includes("backend-specific verification"));
});
