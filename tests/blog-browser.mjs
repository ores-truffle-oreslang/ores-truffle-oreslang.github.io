import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { chromium, firefox, webkit } from "playwright";
import { mkdir } from "node:fs/promises";
import { resolve, join } from "node:path";
import AxeBuilder from "@axe-core/playwright";

const preview = spawn("npm", ["run", "preview", "--", "--host", "127.0.0.1", "--port", "4321"], {
  stdio: "inherit",
  detached: process.platform !== "win32",
});
const base = "http://127.0.0.1:4321";
const screenshotDirectory = resolve("test-artifacts/screenshots");
await mkdir(screenshotDirectory, { recursive: true });
async function ready() {
  for (let attempt = 0; attempt < 80; attempt++) {
    if (preview.exitCode !== null) throw new Error("Astro preview exited before listening");
    try {
      const response = await fetch(base + "/logs/");
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Astro preview did not start");
}
try {
  await ready();
  for (const [engine, launcher] of [["chromium", chromium], ["firefox", firefox], ["webkit", webkit]]) {
    const browser = await launcher.launch({ headless: true });
    try {
      for (const width of [375, 768, 1440]) {
        const context = await browser.newContext({
          viewport: { width, height: 900 },
          reducedMotion: "reduce",
        });
        try {
          for (let n = 1; n <= 7; n++) {
            const page = await context.newPage();
            const label = engine + " " + width + "px log " + n;
            const pageErrors = [];
            page.on("pageerror", (error) => pageErrors.push(error.message));
            try {
              const response = await page.goto(base + "/logs/" + n + "/", {
                waitUntil: "domcontentloaded",
              });
              assert.equal(response.status(), 200, label + " response");
              assert.equal(await page.locator(".log-entry-header h1").count(), 1, label + " h1");
              const ids = await page.locator(".log-toc a").evaluateAll((nodes) =>
                nodes.map((node) => node.getAttribute("href").slice(1))
              );
              assert.ok(ids.length >= 5, label + " anchors");
              assert.deepEqual(await page.evaluate((anchors) =>
                anchors.filter((id) => !document.getElementById(id)), ids
              ), [], label + " missing sections");
              const overflow = await page.evaluate(() =>
                document.documentElement.scrollWidth - window.innerWidth
              );
              if (overflow > 2) {
                const offenders = await page.evaluate(() => [...document.querySelectorAll("body *")]
                  .map((el) => {
                    const box = el.getBoundingClientRect();
                    return {
                      element: el.tagName.toLowerCase(),
                      className: typeof el.className === "string" ? el.className.slice(0, 100) : "",
                      x: Math.round(box.x),
                      right: Math.round(box.right),
                      width: Math.round(box.width),
                      scrollWidth: el.scrollWidth,
                      overflowX: getComputedStyle(el).overflowX,
                    };
                  })
                  .filter((item) => item.right > window.innerWidth + 2 && item.x < window.innerWidth)
                  .slice(0, 20));
                console.error("OVERFLOW_DIAGNOSTICS " + label + " " + JSON.stringify(offenders));
                await page.screenshot({
                  path: join(screenshotDirectory, "overflow-" + engine + "-" + width + "-log-" + n + ".png"),
                  fullPage: false,
                }).catch(() => {});
              }
              assert.ok(overflow <= 2, label + " horizontal overflow " + overflow);
              await page.locator(".log-prompt-summary").focus();
              await page.keyboard.press("Enter");
              assert.equal(await page.locator(".log-prompt-disclosure").evaluate((node) => node.open), true);
              if (engine === "chromium" && width === 375) {
                const results = await new AxeBuilder({ page }).withTags([
                  "wcag2a", "wcag2aa", "wcag21a", "wcag21aa"
                ]).analyze();
                const problems = results.violations.filter((entry) =>
                  entry.impact === "serious" || entry.impact === "critical"
                );
                assert.deepEqual(problems.map((v) => ({
                  id: v.id, targets: v.nodes.map((node) => node.target).slice(0, 4)
                })), [], label + " accessibility");
              }
              await page.waitForLoadState("load");
              assert.deepEqual(pageErrors, [], label + " uncaught browser errors");
              if ((n === 6 || n === 7) && (width === 375 || width === 1440)) {
                await page.screenshot({
                  path: join(screenshotDirectory, engine + "-" + width + "-log-" + n + ".png"),
                  fullPage: false,
                  animations: "disabled",
                });
              }
              console.log("PASS " + label);
            } finally {
              await page.close();
            }
          }
          const archive = await context.newPage();
          try {
            const response = await archive.goto(base + "/logs/", { waitUntil: "load" });
            assert.equal(response.status(), 200, engine + " archive status");
            assert.equal(await archive.locator(".log-list-entry").count(), 7);
            assert.equal(await archive.locator(".log-list-entry a").first().getAttribute("href"), "/logs/7/");
            assert.equal(await archive.locator(".log-list-entry a").last().getAttribute("href"), "/logs/1/");
            assert.equal(await archive.locator(".log-feed-link a").getAttribute("href"), "/rss.xml");
            const overflow = await archive.evaluate(() =>
              document.documentElement.scrollWidth - window.innerWidth
            );
            assert.ok(overflow <= 2, engine + " archive overflow at " + width + "px");
            if (width === 375) {
              await archive.locator(".mobile-navigation summary").click();
              assert.equal(await archive.locator(".mobile-navigation").evaluate((el) => el.open), true);
              assert.equal(await archive.locator(".mobile-navigation a[href='/logs/']").count(), 1);
            }
            await archive.locator('[data-theme-choice="light"]').click();
            assert.equal(await archive.locator("html").getAttribute("data-theme"), "light");
            assert.equal(await archive.locator('[data-theme-choice="light"]').getAttribute("aria-pressed"), "true");
            await archive.locator('[data-theme-choice="dark"]').click();
            assert.equal(await archive.locator("html").getAttribute("data-theme"), "dark");
            if (width === 375 || width === 1440) {
              await archive.screenshot({
                path: join(screenshotDirectory, engine + "-" + width + "-archive.png"),
                fullPage: false,
                animations: "disabled",
              });
            }
            console.log("PASS " + engine + " " + width + "px archive");
          } finally {
            await archive.close();
          }
        } finally {
          await context.close();
        }
      }
    } finally {
      await browser.close();
    }
  }
} finally {
  if (process.platform !== "win32" && preview.pid) {
    try {
      process.kill(-preview.pid, "SIGTERM");
    } catch {
      preview.kill("SIGTERM");
    }
  } else {
    preview.kill("SIGTERM");
  }
}
