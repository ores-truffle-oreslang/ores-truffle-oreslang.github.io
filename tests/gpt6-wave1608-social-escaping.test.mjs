import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const layout = readFileSync(new URL("../src/layouts/BaseLayout.astro", import.meta.url), "utf8");
const homepageEscape = String.raw`.replace(/</g, "\\u003c")`;
const articleEscape = String.raw`.replace(/</g, '\\u003c')`;

test("home and article JSON-LD always escape literal script terminators", () => {
  assert.match(layout, /const websiteJsonLd = home \? JSON\.stringify\(/u);
  assert.match(layout, /const articleJsonLd = article \? JSON\.stringify\(/u);
  assert.ok(layout.includes(homepageEscape), "home JSON-LD escaped");
  assert.ok(layout.includes(articleEscape), "article JSON-LD escaped");
  assert.ok(layout.includes('set:html={websiteJsonLd}'));
  assert.ok(layout.includes('set:html={articleJsonLd}'));
});

test("escaping preserves JSON meaning while blocking script-tag breakouts", () => {
  const hostile = '</script><script>alert("owned")</script>\u2028';
  const serialized = JSON.stringify({ headline: hostile }).replace(/</g, "\\u003c");
  assert.ok(!serialized.includes("</script>"));
  assert.ok(!serialized.includes("<script>"));
  assert.deepEqual(JSON.parse(serialized), { headline: hostile });
  assert.equal(JSON.stringify({ headline: hostile }).includes("</script>"), true);
});
