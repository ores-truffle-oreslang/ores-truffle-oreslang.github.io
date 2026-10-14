import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, extname, relative, sep } from "node:path";

const root = join(process.cwd(), "dist");
const origin = "https://ores-truffle-oreslang.github.io";
function allFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const pathname = join(directory, entry.name);
    return entry.isDirectory() ? allFiles(pathname) : [pathname];
  });
}
const files = allFiles(root);
const pages = files.filter((file) => file.endsWith(".html"));
const markup = new Map(pages.map((file) => [
  "/" + relative(root, file).split(sep).join("/").replace(/index\.html$/u, ""),
  readFileSync(file, "utf8"),
]));
const ids = new Map([...markup.entries()].map(([pathname, html]) => [
  pathname,
  new Set([...html.matchAll(/\bid="([^"]+)"/gu)].map((m) => m[1])),
]));
const attr = (tag, name) => tag.match(new RegExp("(?:^|\\s)" + name + '="([^"]*)"', "u"))?.[1] ?? null;
const decodeHtml = (s) => s.replace(/&amp;/gu, "&").replace(/&quot;/gu, '"');
function asDistFile(pathname) {
  const segments = decodeURIComponent(pathname).split("/");
  if (segments.includes("..") || segments.includes("\0")) throw new Error("Unexpected path " + pathname);
  const clean = segments.filter(Boolean).join("/");
  const candidate = join(root, clean);
  return !clean || !extname(candidate) ? join(candidate, "index.html") : candidate;
}
function pagePath(file) {
  return "/" + relative(root, file).split(sep).join("/").replace(/index\.html$/u, "");
}

test("all static HTML pages exist and contain no duplicate IDs", () => {
  assert.ok(pages.length >= 15, "Unexpectedly few generated pages");
  for (const [route, html] of markup) {
    assert.match(html, /<html\b/iu, route + " missing root HTML");
    const count = [...html.matchAll(/\bid="([^"]+)"/gu)].length;
    assert.equal(ids.get(route).size, count, route + " duplicate element IDs");
  }
});

test("all local site links and assets resolve, including cross-page fragments", () => {
  let checked = 0;
  for (const [route, html] of markup) {
    for (const match of html.matchAll(/<(?:a|link|script|img|source)\b[^>]*>/giu)) {
      const tag = match[0];
      for (const field of ["href", "src"]) {
        const raw = attr(tag, field);
        if (!raw || /^(?:mailto:|tel:|data:|javascript:)/iu.test(raw)) continue;
        let target;
        try { target = new URL(decodeHtml(raw), origin + route); }
        catch { throw new Error(route + " invalid " + field + "=" + raw); }
        if (target.origin !== origin) continue;
        const local = asDistFile(target.pathname);
        assert.ok(existsSync(local), route + " broken " + field + "=" + raw);
        if (target.hash && local.endsWith(".html")) {
          const hash = decodeURIComponent(target.hash.slice(1));
          if (hash) {
            const otherRoute = pagePath(local);
            assert.ok(ids.get(otherRoute)?.has(hash), route + " broken anchor " + raw);
          }
        }
        checked++;
      }
    }
  }
  assert.ok(checked >= 80, "Expected meaningful local-link coverage, got " + checked);
  console.log("Resolved " + checked + " local href/src references across " + pages.length + " generated pages");
});

test("every generated HTML route has exactly one canonical sitemap entry", () => {
  const sitemap = readFileSync(join(root, "sitemap.xml"), "utf8");
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/gu)].map((m) => m[1]);
  assert.equal(new Set(locs).size, locs.length, "Duplicate sitemap entries");
  const canonicalPaths = new Set(locs.map((url) => new URL(url).pathname));
  for (const route of markup.keys()) {
    assert.ok(canonicalPaths.has(route), "Missing route in sitemap: " + route);
  }
});
