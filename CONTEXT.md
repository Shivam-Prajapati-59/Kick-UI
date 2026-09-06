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
- **Category** — one of the canonical list in
  `src/lib/component-categories.ts`. Declared once by hand; the frontmatter
  schema and the sidebar both derive it.
- **Artifact** — built JSON under `public/r/` served to the shadcn CLI.
  Committed, never hand-edited. Dependencies are auto-detected from
  imports; stale artifacts are pruned by the build.
- **Pipeline** — `scripts/build-registry.mjs` (artifacts, hardened:
  auto-deps, shadcn-schema validation, pruning),
  `scripts/build-docs.mjs` (generated index and demo map), and
  `scripts/registry-check.mjs` (bidirectional verification, never writes).
- **Generated files** — `src/generated/*` (docs index, demo map).
  Committed; CI verifies freshness.
- **Frontmatter contract** — `src/lib/component-doc-schema.ts`, the single
  zod schema for doc frontmatter. Build scripts consume it directly
  (always run scripts through `bun`, never plain `node`, so the `.ts`
  import resolves).
- **Preview** — the docs-page viewer: live demo plus usage/source tabs and
  per-manager install commands derived from a single command module.
- **Playground** — the `/playground` scratch route for manual experiments.
  Not part of distribution; nothing discovers it automatically.

## Load-bearing conventions

- Filename is truth: `<name>` must match across `registry.json`, the doc
  filename, and `src/demos/<name>.tsx`. `registry:check` enforces every
  direction, and both builds fail hard on orphans; do not add a second
  declaration of the name, and do not invent placeholder sources.
- Docs install examples derive from `SITE_CONFIG.url` via
  `src/lib/cli-commands.ts`, kept in sync with `registry.json` by check.
- Pure pipeline verification lives in `scripts/lib/verify.mjs` (no
  filesystem access) so `bun test tests` covers the pipeline without a
  browser. Browser-driven suites live in `tests/e2e/` and need a running
  server.
- The docs chrome offset derives from `--navbar-height`: provider padding
  and sidebar position share the token so the columns cannot drift apart.
- ADRs live in `docs/adr/`. Record one when a review suggestion is
  rejected for a reason a future explorer would need in order not to
  re-suggest it; skip ephemeral or self-evident reasons.
