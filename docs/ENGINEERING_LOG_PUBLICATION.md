# Publishing and verifying engineering logs

Engineering logs are dated technical design discussions. They are not a released
language specification, and an architecture proposal is not proof of compiler support.

## Evidence policy

Before publishing or substantially revising a technical claim:

1. Label it **verified**, **experimental/in progress**, **proposed**, or
   **historical (as of the article date)**. Re-check old status tables when editing.
2. A claim of *compiler-verified* Oreslang code requires a compiler repository,
   immutable commit SHA, exact source example, invocation, and successful CI
   result. Without those, label the example *illustrative*.
3. Do not infer LLVM/GraalVM parity, GPU support, or guest-code AOT readiness from
   a marketing diagram, draft PR, code sample, or the existence of a repository.
4. Keep external sources as direct references when possible; private repository
   links cannot serve as publicly inspectable evidence for outside readers.
5. Explain both correctness and limitation: throughput, safety and zero-GC
   claims need workload and measurement context.

## Article publishing checklist

- One descriptive `h1` per log. The expandable original prompt is a disclosure,
  not the page heading.
- Maintain article publication and modification dates, author, canonical link,
  and `TechArticle` structured data.
- Keep `/logs/` reverse chronological, and wire previous/next/archive links.
- Register each entry in `src/data/engineering-logs.mjs`; archive and RSS
  read the catalog, and tests verify its metadata against the Astro article.
- Every table-of-contents entry must resolve to a unique semantic section.
- Include alt text and dimensions for figures. Scrolling diagrams and code
  blocks must remain keyboard-focusable.
- If a source code fragment has not actually been compiled for a pinned Oreslang
  revision, describe it as a design example rather than a validated program.
- Do not introduce unreviewed executable HTML, third-party embeds or external
  scripts into engineering articles.

## Reproducing quality gates

From the repository root, with Node.js 22.20.0 and the pinned syntax-highlighter
submodule:

```sh
npm install
npm test
python3 tests/log7_svg_test.py
npm run build
npm run test:blogs:build
npx playwright install --with-deps chromium firefox
npm run test:blogs:browser
```

The rendered-output gate validates all seven published routes, their sitemap
entries, article metadata/JSON-LD, local assets and table-of-contents anchors.
The browser gate loads each log in Chromium and Firefox at 375, 768, and 1440px,
checks keyboard-operated disclosures and horizontal overflow, and runs axe-core
WCAG serious/critical checks on mobile Chromium.

The `Validate marketing site` pull-request workflow runs these checks. A
separate `Manual independent blog audit` workflow is intentionally on-demand,
so ordinary PRs do not pay for duplicate builds.

## GitHub Actions capacity fallback

Use the current repository's PR runner first. If it cannot run for budget or
organization-policy reasons, a funded test repository may run an exact-tree
mirror **without cross-organization checkout credentials**. Verify the full Git
tree identity (including submodule gitlinks) and record the tested PR head,
source tree SHA, mirror tree SHA and workflow URL. A run on a similar branch,
a rebuilt patch, or a nonidentical tree is not evidence that the PR passed.
If an exact mirror cannot be established, report CI as unverified.
