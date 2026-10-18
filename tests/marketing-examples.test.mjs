import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { highlight } from "../vendor/html-js-css-syntax-highlighter/src/index.js";

for (const page of ["index", "examples"]) {
  const text = readFileSync(new URL(`../src/pages/${page}.astro`, import.meta.url), "utf8");
  const sample = (name) => {
    const code = text.match(new RegExp(`const ${name} = \`([\\s\\S]*?)\`;`))?.[1];
    assert.ok(code, `${page}: missing ${name}`);
    return code;
  };

  test(`${page}: three actor definitions compose into an ActorStream<int>`, () => {
    const code = sample("pipelineCode");
    for (const name of ["Source", "Transform", "Sink"]) {
      assert.match(code, new RegExp(`define actor ${name} as\\s*end`));
    }
    assert.equal((code.match(/define actor /g) || []).length, 3);
    assert.match(code, /pub fnc connect\(\): ActorStream<int>\s*\{/);
    assert.match(code, /return spawn Source\(\) pipe spawn Transform\(\) pipe spawn Sink\(\);/);
    assert.doesNotMatch(code, /\b\|>\b/);
  });

  test(`${page}: ML design sample shows 1F1B backprop and optimizer`, () => {
    const code = sample("mlCode");
    for (const token of [
      "define model Classifier as", "Dense(784, 512)", "Dense(512, 10)",
      "ml.pipeline(", "#one_forward_one_backward",
      "ml.trainer(", "CrossEntropy()", "AdamW(lr: 0.001)", "microbatches: 16",
      "Forward:", "Backward:", "gradients", "await trainer.train(dataset)"
    ]) {
      assert.ok(code.includes(token), `${page}: ML sample missing ${token}`);
    }
    assert.match(text, /not compiler-verified|not been compiler-verified/);
  });

  test(`${page}: HTTP actor maps a request to a typed response`, () => {
    const code = sample("httpCode");
    assert.match(code, /define actor HelloHttp extends HttpActor as/);
    assert.match(code, /on_request\(HttpRequest request\): HttpResponse/);
    assert.match(code, /HttpResponse\([\s\S]*?status: 200,[\s\S]*?body:/);
    assert.match(code, /spawn HelloHttp\(\)/);
    assert.match(text, /proposed/i);
  });

  test(`${page}: select uses a single supported prefix and channel arms`, () => {
    const code = sample("selectCode");
    assert.match(code, /\bnb select\s*\{/);
    assert.doesNotMatch(code, /\bdo\s+nb\s+select\b/);
    assert.doesNotMatch(text, /\bdo\s+nb\s+select\s*\{/);
    assert.match(code, /when readch \w+: val \w+ \{/);
    assert.match(code, /when writech \w+, \w+: \{/);
    assert.doesNotMatch(code, /when (?:await|timeout|cancelled)\b/);
    assert.match(code, /Inside an actor's mailbox handler/);
  });
}

test("select documentation lists all three mutually exclusive forms", () => {
  const text = readFileSync(new URL("../src/pages/examples.astro", import.meta.url), "utf8");
  for (const form of ["select {}", "do select {}", "nb select {}"]) {
    assert.ok(text.includes(`<code>${form}</code>`), form);
  }
});

test("structural, over and static have keyword token styles", () => {
  const html = highlight("match x over on structural {id: string} a -> {} end static fnc f(): void {}", "oreslang");
  for (const keyword of ["match", "over", "on", "structural", "static", "fnc", "end"]) {
    assert.ok(html.includes(`<span class="tok-keyword">${keyword}</span>`), keyword);
  }
});
