# Kick-UI context

Kick-UI is a shadcn-compatible library of animated React modules plus the
Next.js site that documents, previews, and distributes them. Consumers
install source through the shadcn CLI (`public/r/*.json`); the site renders
docs from MDX and live previews from demo modules.

Architecture reviews and ADRs must use the glossary below. Prefer these
terms over file-level names when discussing a change; add a term here when
a change names a concept that is missing, and sharpen a term here when a
review exposes fuzziness.

## Domain glossary

- **Registry item** — one distributable module: an entry in `registry.json`
  plus its source under `registry/new-york/components/<name>/`.
- **Doc** — `content/components/<category>/<name>.mdx`: title, description,
  usage snippet, and props table. The filename is the slug.
- **Demo** — `src/demos/<name>.tsx` with a default export rendering the live
  preview for that slug.
- **Identity** — the shared name binding item, doc, and demo together. The
  filename is the truth; nothing else declares it. There is no `demo`
  field anywhere.
- **Category** — one of the canonical list in `scripts/lib/categories.mjs`
  (`buttons`, `cards`, `components`, `text-animations`,
  `layouts-sections`, `animations`). Declared once; everything else
  derives it.
- **Artifact** — built JSON under `public/r/` served to the shadcn CLI.
  Committed, never hand-edited.
- **Pipeline** — `scripts/build-registry.mjs` (artifacts),
  `scripts/build-docs.mjs` (generated index, demo map, categories), and
  `scripts/registry-check.mjs` (bidirectional verification, never writes).
- **Generated files** — `src/generated/*` (docs index, demo map) and
  `src/lib/component-categories.ts`. Committed; CI verifies freshness.
- **Distributable** — whether a doc has a shippable registry source yet.
  Non-distributable docs set `distributable: false` instead of faking it.
- **Preview** — the docs-page viewer: live demo plus usage/source tabs and
  per-manager install commands derived from a single command module.
- **Playground** — the `/playground` scratch route for manual experiments.
  Not part of distribution; nothing discovers it automatically.

## Load-bearing conventions

- Filename is truth: `<name>` must match across `registry.json`, the doc
  filename, and `src/demos/<name>.tsx`. `registry:check` enforces both
  directions; do not add a second declaration of the name.
- Docs-only work in progress uses `distributable: false`; do not invent
  placeholder sources to satisfy the check.
- Docs install examples derive from `REGISTRY_HOMEPAGE` in
  `src/lib/cli-commands.ts`, kept in sync with `registry.json` by check.
- Pure pipeline verification lives in `scripts/lib/verify.mjs` (no
  filesystem access) so `bun test tests` covers the pipeline without a
  browser.
- ADRs live in `docs/adr/`. Record one when a review suggestion is
  rejected for a reason a future explorer would need in order not to
  re-suggest it; skip ephemeral or self-evident reasons.
