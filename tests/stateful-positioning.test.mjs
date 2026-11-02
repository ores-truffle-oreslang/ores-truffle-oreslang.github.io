import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const home = readFileSync(new URL("../src/pages/index.astro", import.meta.url), "utf8");
const about = readFileSync(new URL("../src/pages/about.astro", import.meta.url), "utf8");

test("homepage leads with the stateful-applications motivation and core influences", () => {
  for (const concept of [
    "stateless REST APIs", "WebSocket servers", "gaming backends",
    "UIs", "state machines for distributed coordination", "message queues",
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
    "WebSocket servers", "gaming backends", "UIs",
    "state machines for distributed coordination", "message queues",
    "development", "Erlang", "Rust", "Microsoft Orleans",
    "ahead-of-time (AOT)", "native binaries", "fault-tolerant actors",
    "hot upgrades", "Italian", "Japanese", "attō", "圧倒"
  ]) {
    assert.ok(about.includes(concept), "About missing " + concept);
  }
  assert.ok(about.includes("AttoLang was formerly known as Oreslang."));
});

test("marketing copy states the performance, safety, and runtime proposition directly", () => {
  assert.match(home, /more than <strong>10× the speed of Erlang<\/strong>/u);
  assert.match(home, /<strong>one-tenth the compute<\/strong>/u);
  assert.match(home, /type safety and memory safety/u);
  assert.match(about, /more than <strong>10× the speed of Erlang<\/strong>/u);
  assert.match(about, /<strong>one-tenth the compute<\/strong>/u);
  for (const feature of ["full ahead-of-time (AOT) compilation", "native binaries",
    "zero GC", "fault-tolerant actors", "better hot upgrades"]) {
    assert.ok(home.includes(feature), "homepage missing " + feature);
    assert.ok(about.includes(feature), "About page missing " + feature);
  }
  assert.doesNotMatch(home, /unverified results|not measured|engineering targets/iu);
  assert.doesNotMatch(about, /unverified results|not measured|aspiration|architectural goals/iu);
});
