# Oreslang marketing site

Marketing site for [Oreslang](https://github.com/ores-truffle-oreslang), built with **Astro**.

## Local development

Requires Node.js 22.20.0 or newer.

```bash
npm install
npm run dev
```

Build and validate:

```bash
npm run build
```

The homepage is intentionally both a landing page and a table of contents:

- nav links scroll to `/#about`, `/#examples`, `/#problem-spaces`, and `/#links`
- section headings open the dedicated `/about/`, `/examples/`, `/problem-spaces/`, and `/links/` pages

## Oreslang syntax highlighting

`src/lib/oresHighlight.ts` contains a small Oreslang-specific tokenizer used by
`src/components/OresCode.astro`. It recognizes Oreslang comments, strings,
keywords, built-in types, symbols/types, numbers, and operators without treating
the language as another existing grammar.

## Deployment

`.github/workflows/deploy.yml` builds Astro and deploys `dist/` to GitHub Pages.
`public/.nojekyll` explicitly disables Jekyll processing.
