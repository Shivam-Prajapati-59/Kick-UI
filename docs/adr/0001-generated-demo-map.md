# ADR-0001: Generated demo map from the per-slug demo convention

## Status

Accepted.

## Context

Each registry item needs a live preview. The preview lookup used to be a
hand-maintained map in `DemoRenderer.tsx`, keyed by name, validated in the
build scripts by parsing that file with a regex. Every addition therefore
touched the map by hand, and the regex broke silently on reformatting.
The MDX `demo` frontmatter field duplicated the same name a third time.

## Decision

- One demo module per item at `src/demos/<name>.tsx` with a default export.
- `scripts/build-docs.mjs` generates `src/generated/demo-map.ts` from that
  directory; `DemoRenderer` consumes the generated map.
- The MDX `demo` field is removed; the slug derives the demo.
- `scripts/registry-check.mjs` verifies item/doc/demo identity both ways.

## Consequences

- Adding a preview is adding a file; no map edit, nothing to parse.
- A demo without a default export fails `registry:check` before `next build`.
- Generated files (`src/generated/*`) must stay committed; CI verifies them.
