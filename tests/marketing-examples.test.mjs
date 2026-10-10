import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { highlight } from "../vendor/html-js-css-syntax-highlighter/src/index.js";

for (const page of ["index", "examples"]) {
  const text = readFileSync(new URL(`../src/pages/${page}.astro`, import.meta.url), "utf8");
  test(`${page}: actor sample uses the real mailbox protocol, not method RPC`, () => {
    assert.match(text, /receive\(ActorMail<\w+> mail\): void/);
    assert.match(text, /mail\.value/);
    assert.match(text, /worker\.send\(/);
    assert.doesNotMatch(text, /pub\s+(?:async\s+)?fnc\s+(?:on_start|receive|transform|run)\b/);
    assert.doesNotMatch(text, /worker\.(?:run|transform)\(/);
  });

  test(`${page}: select sample uses supported actor-scoped channel arms`, () => {
    const code = text.match(/const selectCode = `([\s\S]*?)`;/)?.[1];
    assert.ok(code, "select sample must exist");
    assert.match(code, /do nb select\s*\{/);
    assert.match(code, /when readch \w+: val \w+ \{/);
    assert.match(code, /when writech \w+, \w+: \{/);
    assert.doesNotMatch(code, /when (?:await|timeout|cancelled)\b/);
    assert.match(code, /Inside an actor's mailbox handler/);
  });
}

test("structural, over and static have keyword token styles", () => {
  const html = highlight("match x over on structural {id: string} a -> {} end static fnc f(): void {}", "oreslang");
  for (const keyword of ["match", "over", "on", "structural", "static", "fnc", "end"]) {
    assert.ok(html.includes(`<span class="tok-keyword">${keyword}</span>`), keyword);
  }
});
