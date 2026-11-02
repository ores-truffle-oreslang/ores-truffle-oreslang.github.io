# AttoLang public brand and compatibility policy

The current public language name is **AttoLang** (capital A and L). The existing GitHub organization and historical `oreslang-*` repository names are **not** the public product name. Do not rename them as part of marketing cleanup.

- Use **AttoLang** in page titles, descriptions, introductions, visible labels, screenshots, RSS, social previews, and current explanatory prose.
- Write new language source, examples and fixtures with `.atto` where the selected compiler/toolchain supports it. Historical `.ores` fixtures and executables must not be silently renamed: validate compatibility and migrate through explicit tooling work.
- Preserve existing `oreslang` CLI and compiler commands, `ORESLANG_*` environment variables, syntax-highlighter IDs, JSON schema keys, internal URLs, historical anchors, and the **OresVM** runtime name until independent versioned migrations ship.
- Do not rewrite quoted historical prompts, immutable benchmark receipts, legal terms, or external citations merely to eliminate the old text.
- Public sample code remains illustrative unless exact compiler and backend evidence is linked. Branding must not imply unsupported runtime parity.
- New public assets should use the checked-in `attolang-wordmark.svg`; the favicon is a simple monochrome o-with-caret companion.
- `social-preview.svg` is vector source for a 1200×630 social graphic. Some social crawlers reject SVG; publish and independently validate a PNG/JPEG equivalent before claiming universal social-card compatibility.

Run `npm test`, `npm run build`, site/RSS checks, and real browser accessibility/visual checks against the exact PR head. A zero-step or skipped CI run is **not** evidence of passing tests.
