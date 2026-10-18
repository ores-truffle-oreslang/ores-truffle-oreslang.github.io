import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { languageMotionExamples as motion } from "../src/data/language-motion-examples.mjs";
import { highlight } from "../vendor/html-js-css-syntax-highlighter/src/index.js";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const home = read("../src/pages/index.astro");
const detail = read("../src/pages/examples.astro");

test("home and examples import the same immutable code snippets", () => {
  for (const [page, text] of [["index", home], ["examples", detail]]) {
    assert.match(text, /import \{ languageMotionExamples as motion \} from "\.\.\/data\/language-motion-examples\.mjs"/);
    assert.match(text, /const \{ pipelineCode, mlCode, httpCode, selectCode \} = motion;/);
    for (const name of ["pipelineCode", "mlCode", "httpCode", "selectCode"]) {
      assert.ok(text.includes("code={" + name + "}"), page + " missing " + name);
      assert.doesNotMatch(text, new RegExp("const " + name + " = `"));
    }
    assert.match(text, /not compiler-verified|not been compiler-verified/);
  }
  assert.ok(Object.isFrozen(motion));
});

test("three pipeline actors and exact typed pipe operator remain visible", () => {
  const code = motion.pipelineCode;
  for (const name of ["Source", "Transform", "Sink"]) {
    assert.match(code, new RegExp("define actor " + name + " as\\s*end"));
  }
  assert.equal((code.match(/define actor /g) || []).length, 3);
  assert.match(code, /pub fnc connect\(\): ActorStream<int>\s*\{/);
  assert.match(code, /return spawn Source\(\) pipe spawn Transform\(\) pipe spawn Sink\(\);/);
  assert.doesNotMatch(code, /\|>/);
  assert.match(home, /Empty actors show topology/);
});

test("ML example presents forward activations and reverse gradient flow without release claims", () => {
  const code = motion.mlCode;
  for (const token of ["define model Classifier as", "Dense(784, 512)", "Dense(512, 10)",
    "ml.pipeline(", "#one_forward_one_backward", "ml.trainer(", "CrossEntropy()",
    "AdamW(lr: 0.001)", "microbatches: 16", "Forward:", "Backward:",
    "self.backward(...)", "await trainer.train(dataset)"]) {
    assert.ok(code.includes(token), "missing ML example token " + token);
  }
  assert.match(code, /not a shipping compiler feature/);
  assert.doesNotMatch(code, /zero.copy|production.ready|verified backend/i);
});

test("HTTP design uses VM-owned unary transport and exactly one returned reply", () => {
  const code = motion.httpCode;
  assert.match(code, /define unary http actor HelloHttp as/);
  assert.match(code, /run\(HttpMessage request\): string\s*\{/);
  assert.match(code, /return "hello from Oreslang";/);
  assert.doesNotMatch(code, /extends HttpActor|on_request\(|spawn HelloHttp\(|\.get_response\(|\.write\(/);
  assert.match(code, /VM-owned HTTP binding/);
  assert.match(code, /not yet compiler-verified/);
});

test("select demo is a suspending statement, not a synchronous poll", () => {
  const code = motion.selectCode;
  assert.match(code, /\bdo select\s*\{/);
  assert.match(code, /when readch \w+: val \w+ \{/);
  assert.match(code, /when writech \w+, \w+: \{/);
  assert.doesNotMatch(code, /\bdo\s+nb\s+select\b|\btry\s+select\b|\bwhen\s+nb\s+readch\b/);
  assert.doesNotMatch(home + detail + code, /Poll once without waiting|nonblocking poll|repeated selection/);
  for (const form of ["select {}", "do select {}", "nb select {}"]) {
    assert.ok(detail.includes("<code>" + form + "</code>"), form);
  }
  assert.match(detail, /suspending result expression/);
  assert.match(detail, /suspending statement/);
  assert.match(detail, /asynchronous expression returning a Future/);
  assert.match(detail, /design target across backends/);
});

test("Oreslang code remains HTML escaped and highlighted", () => {
  const raw = "pub fnc connect(): ActorStream<int> { return spawn Source() pipe spawn Sink(); }";
  const html = highlight(raw, "oreslang");
  assert.ok(html.includes("&lt;int&gt;"));
  assert.match(html, /tok-keyword/);
  assert.ok(!html.includes("<int>"));
  const structural = highlight("match x over on structural {id: string} a -> {} end static fnc f(): void {}", "oreslang");
  for (const keyword of ["match", "over", "on", "structural", "static", "fnc", "end"]) {
    assert.ok(structural.includes(`<span class="tok-keyword">${keyword}</span>`), keyword);
  }
});
