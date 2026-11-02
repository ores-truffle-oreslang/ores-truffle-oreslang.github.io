# AttoLang brand identity and migration

**Public brand:** AttoLang (the programming language formerly called Oreslang).
The official wordmark is the provided lowercase **attolang** lettering; do not
retype it in a different font, stretch it, add decorative marks, or recolor the
individual letters.

## Approved assets

- Black wordmark: [SVG](/attolang-wordmark.svg), [PNG](/brand/attolang-black.png)
- White wordmark: [SVG](/attolang-wordmark-light.svg), [PNG](/brand/attolang-white.png)
- Square first-letter favicon: [SVG](/favicon.svg), [180px PNG](/brand/attolang-icon-180.png)
- Social preview: [1200 × 630 PNG](/brand/attolang-social.png)

The SVG wordmarks are the canonical editable assets. PNGs and social previews
are reproducibly rendered by \`scripts/build-brand-assets.mjs\` during
\`npm run build\`, using Sharp from the pinned dependency tree. No external
fonts, images, scripts, or network accesses are needed. The favicon extracts the
original first-letter glyph, preserving its contours.

## Language rename boundaries

Use **AttoLang** in all new public marketing prose, page titles, social
metadata and project introductions. Mention **Oreslang** only when discussing
the project's earlier name, dated releases, or compatibility identifiers.

Keep historical GitHub organization/repository paths, published routes,
\`.ores\` source compatibility, grammar IDs, package coordinates, and
\`oreslang-theme\` preference keys until separately versioned migrations.
The site is hosted at \`ores-truffle-oreslang.github.io\`; changing the
public brand does not change the canonical origin or establish a new domain.

Current language status and backend parity must be established with released
compiler versions and independently reproducible tests, not branding changes.
