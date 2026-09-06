# ADR-0002: Single TypeScript frontmatter schema consumed via bun

## Status

Accepted.

## Context

Doc frontmatter was validated in two places with different strictness: a
loose inline schema in the docs runtime and a stricter one in the build
scripts, so development accepted docs the build rejected. A separate
script-side schema file would merely move the duplication.

## Decision

- `src/lib/component-doc-schema.ts` is the single zod contract, imported
  by the docs runtime and by both build scripts alike.
- Pipeline scripts always run through `bun` (never plain `node`) so the
  `.ts` import resolves in every environment, including CI.
- A docs-only work-in-progress state (`distributable` flag) was considered
  and rejected: both builds fail hard on orphans instead, so every doc
  always has a shippable source.

## Consequences

- Frontmatter shape changes in exactly one file.
- `bun test tests` pins the check helpers; the schema itself is exercised
  by both builds on every real doc.
- Do not reintroduce a second schema file for the scripts.
