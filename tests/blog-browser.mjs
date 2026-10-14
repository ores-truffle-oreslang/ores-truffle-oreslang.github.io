import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { chromium, firefox } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const preview = spawn("npm", ["run", "preview", "--", "--host", "127.0.0.1", "--port", "4321"], {
  stdio: "inherit",
  detached: false,
});
const base = "http://127.0.0.1:4321";
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
  for (const [engine, launcher] of [["chromium", chromium], ["firefox", firefox]]) {
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
              console.log("PASS " + label);
            } finally {
              await page.close();
            }
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
  preview.kill("SIGTERM");
}
