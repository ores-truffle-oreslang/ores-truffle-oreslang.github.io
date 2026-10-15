# Oreslang marketing site

Marketing site for [Oreslang](https://github.com/ores-truffle-oreslang), built with **Astro**.

## Local development

Requires Node.js 22.20.0 or newer.

```bash
git clone --recurse-submodules https://github.com/ores-truffle-oreslang/ores-truffle-oreslang.github.io.git
cd ores-truffle-oreslang.github.io
npm ci
npm run dev
```

If the repository was already cloned:

```bash
git submodule update --init --recursive
```

Build and validate:

```bash
npm run build
```

The homepage is intentionally both a landing page and a table of contents:

- nav links scroll to `/#about`, `/#examples`, `/#problem-spaces`, and `/#links`
- section headings open the dedicated `/about/`, `/examples/`, `/problem-spaces/`, and `/links/` pages


## Engineering logs and publishing

Engineering-log titles, dates, summaries and archive ordering live in
`src/data/engineering-logs.mjs`. The archive and
[`/rss.xml`](https://ores-truffle-oreslang.github.io/rss.xml) use that catalog,
and CI checks that it matches the metadata inside the individual posts.

After editing a log or publishing a new one, run:

```sh
npm test
npm run build
npm run test:blogs:build
npm run test:site:build
npm run test:rss:build
npx playwright install --with-deps chromium firefox
npm run test:blogs:browser
```

See [engineering-log publication standards](docs/ENGINEERING_LOG_PUBLICATION.md)
for verification, accessibility, and evidence requirements.

## Oreslang syntax highlighting

Syntax highlighting lives in the pinned submodule at
`vendor/html-js-css-syntax-highlighter`, backed by:

https://github.com/ores-truffle-oreslang/html-js-css-syntax-highlighter

The site consumes its Astro adapter from
`@ores-truffle-oreslang/html-js-css-syntax-highlighter/adapters/astro`.

To intentionally update the grammar used by the site, advance the submodule pointer
to a tested highlighter commit and commit that pointer change here.

## Deployment

`.github/workflows/deploy.yml` checks out submodules, runs the highlighter's own test
suite, builds Astro, and deploys `dist/` to GitHub Pages.
`public/.nojekyll` explicitly disables Jekyll processing.

## Reproducible website verification

The source repository commits `package-lock.json` and pins its GitHub Actions
to immutable commit SHAs. Use Node 22.20.0 and check out the exact pinned syntax
highlighter submodule before installing dependencies. Use `npm ci` (not
`npm install`) to build the same dependency tree as CI.

The PR workflow checks NPM package integrity, the exact submodule gitlink,
read-only build permissions, high/critical production dependency advisories,
static page references, all seven engineering logs, and browser behavior on
Chromium, Firefox and WebKit.

```sh
npm ci
npm test
npm run build
npm run test:blogs:build
npm run test:site:build
npm run test:rss:build
npx playwright install --with-deps chromium firefox webkit
npm run test:blogs:browser
npm run test:lighthouse
```

Lighthouse reports are **baselines**, not proof that performance targets pass:
the pinned Lighthouse 13.5.0 runner measures the homepage, archive, and actor-LLM
article, saves machine-readable JSON, and prints scores. PR CI retains these
reports and cross-browser visual review captures for seven days. The screenshots
are for review; no pixel-diff baseline is asserted yet.

See [engineering-log publication standards](docs/ENGINEERING_LOG_PUBLICATION.md)
and [example evidence inventory](src/data/engineering-log-examples.json).
