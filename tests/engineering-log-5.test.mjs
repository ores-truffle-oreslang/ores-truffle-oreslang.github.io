import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const index = read("../src/pages/logs/index.astro");
const log4 = read("../src/pages/logs/4.astro");
const log5 = read("../src/pages/logs/5.astro");
const body = read("../src/components/Log5Content.astro");

test("log 5 is indexed newest-first and navigable from log 4", () => {
  assert.ok(index.includes('href="/logs/5/"'));
  assert.ok(index.indexOf("Log 005") < index.indexOf("Log 004"));
  assert.ok(log4.includes('href="/logs/5/"'));
  assert.ok(log5.includes('href="/logs/4/"'));
  assert.ok(log5.includes('href="/logs/"'));
});

test("log 5 follows the article layout and its table of contents resolves", () => {
  assert.ok(log5.includes('import "../../styles/logs.css"'));
  assert.ok(log5.includes("LogPrompt prompt={prompt}"));
  assert.ok(log5.includes("Log5Content"));
  assert.ok(log5.includes('datetime="2026-10-13"'));
  assert.ok(log5.includes("Alex Mills"));
  assert.ok(log5.includes('aria-label="Engineering log #5"'));
  const ids = ["positioning", "first-run", "github", "search-ai", "distribution",
    "community", "metrics", "plan", "oreslang", "closing"];
  for (const id of ids) {
    assert.ok(log5.includes('href="#' + id + '"'), "TOC link for " + id);
    assert.ok(body.includes('id="' + id + '"'), "body section for " + id);
  }
});

test("log 5 covers open-source marketing, AI tooling, verifiability and ethics", () => {
  for (const term of ["open-source", "README", "license", "CONTRIBUTING",
    "SEO", "llms.txt", "AGENTS.md", "MCP", "compiler", "CI", "community",
    "activation", "retention", "90-day", "Oreslang", "purchased stars"]) {
    assert.ok(body.toLowerCase().includes(term.toLowerCase()), "missing " + term);
  }
  assert.ok(body.includes('class="log-table-scroll" role="region" tabindex="0"'));
  assert.ok(body.includes('https://developers.google.com/search/docs/fundamentals/seo-starter-guide'));
});
