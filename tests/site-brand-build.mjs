import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";

const dist = join(process.cwd(), "dist");
const siteOrigin = "https://ores-truffle-oreslang.github.io";
const social = siteOrigin + "/social-preview.svg";

const files = (directory) => readdirSync(directory, { withFileTypes: true })
  .flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? files(path) : path.endsWith(".html") ? [path] : [];
  });

const attribute = (tag, name) =>
  tag.match(new RegExp("(?:^|\\s)" + name + '="([^"]*)"', "u"))?.[1] ?? null;

function metadata(html, key, value) {
  const tags = [...html.matchAll(/<meta\b[^>]*>/gu)].map((m) => m[0]);
  return tags.filter((tag) => attribute(tag, key) === value).map((tag) => attribute(tag, "content"));
}

test("every deployed route has AttoLang discovery metadata and a matching canonical identity", () => {
  const pages = files(dist);
  assert.ok(pages.length >= 15);
  for (const file of pages) {
    const route = "/" + relative(dist, file).split(sep).join("/").replace(/index\.html$/u, "");
    const html = readFileSync(file, "utf8");
    const link = [...html.matchAll(/<link\b[^>]*>/gu)].map((m) => m[0])
      .filter((tag) => attribute(tag, "rel") === "canonical");
    const canonical = new URL(route, siteOrigin).href;
    assert.equal(link.length, 1, route + " must have one canonical link");
    assert.equal(attribute(link[0], "href"), canonical, route + " canonical must match deployed path");

    for (const [type, name, expected] of [
      ["property", "og:site_name", "AttoLang"],
      ["property", "og:url", canonical],
      ["property", "og:image", social],
      ["property", "og:image:type", "image/svg+xml"],
      ["name", "twitter:image", social],
      ["name", "twitter:card", "summary_large_image"],
    ]) {
      assert.deepEqual(metadata(html, type, name), [expected],
        route + " invalid or duplicate " + name);
    }
    const titles = metadata(html, "property", "og:title");
    const descriptions = metadata(html, "property", "og:description");
    assert.equal(titles.length, 1, route + " missing OpenGraph title");
    assert.equal(descriptions.length, 1, route + " missing OpenGraph description");
    assert.ok(titles[0].length > 10 && descriptions[0].length > 40);
    assert.doesNotMatch(titles[0] + " " + descriptions[0], /\bOres[Ll]ang\b/u,
      route + " metadata regressed to legacy display name");
    assert.deepEqual(metadata(html, "name", "twitter:title"), titles);
    assert.deepEqual(metadata(html, "name", "twitter:description"), descriptions);
  }
});

test("the shared social preview is a first-party static asset, not an off-site image", () => {
  assert.ok(existsSync(join(dist, "social-preview.svg")));
  assert.ok(existsSync(join(dist, "attolang-wordmark.svg")));
  const svg = readFileSync(join(dist, "social-preview.svg"), "utf8");
  assert.match(svg, /viewBox="0 0 1200 630"/u);
  assert.match(svg, /AttoLang/u);
  assert.doesNotMatch(svg, /<script\b|<foreignObject\b|<image\b|\bhref\s*=/iu);
});
