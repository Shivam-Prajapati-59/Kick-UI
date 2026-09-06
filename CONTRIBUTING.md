# Contributing to Kick UI

Thanks for your interest in contributing! This guide covers everything you
need to add a component or fix a bug.

## Prerequisites

- Node.js 20+ (Node 24 recommended)
- [Bun](https://bun.sh) 1.3+ (CI pins `bun@1.3.14`)

```bash
git clone <your-fork>
cd kick-ui
bun install
bun dev
```

## Adding a component

The registry folder is the **single source of truth** — components are never
copied into `src/components/ui`.

1. **Create the source file**
   `registry/new-york/components/<name>/<name>.tsx`

   Requirements:
   - `"use client"` if the component uses hooks, motion, or browser APIs.
   - Accept `className?: string`, forward it with `cn()` from `@/lib/utils`.
   - Spread remaining props onto the root element where sensible.
   - Use design tokens (`bg-card`, `text-muted-foreground`, `var(--primary)`)
     — never hardcode palette hexes.

- Respect `prefers-reduced-motion` via `useReducedMotion()` for any
  autoplaying or infinite animation (see `scramble-text.tsx` for the
  reference implementation).
- Keep demo data in the demo module (`src/demos/<name>.tsx`), not in
  the distributable source.

2. **Create the demo module** at `src/demos/<name>.tsx` with a default
   export rendering a representative example. The filename must match the
   registry name exactly — `docs:build` generates the preview map from
   this directory, so there is no map to edit by hand.

3. **Write the docs page** at
   `content/components/<category>/<name>.mdx` with frontmatter:
   `title`, `description`, `category`, `usage`, `props`.
   No `demo` field: the preview is derived from the filename. The build
   validates all of it, and `registry:check` verifies the
   registry/doc/demo identity in both directions.

4. **Register the item** in `registry.json`: name, type
   `registry:component`, files path, and any extra `dependencies`
   (npm deps are otherwise auto-detected from imports by the build).

5. **Verify**: `bun run registry:check && bun docs:build &&
bun registry:build && bun lint && bun typecheck && bun run test:unit`.
   Generated outputs under `public/r/` and `src/generated/` must be
   committed.

## Checks performed on every PR

- ESLint (`bun lint`) and TypeScript strict (`bun typecheck`)
- Pipeline consistency (`bun run registry:check`, no writes)
- Docs index freshness (`bun docs:check`)
- Registry output consistency (`bun registry:build` + git diff)
- Pipeline unit tests (`bun run test:unit`)
- SEO regression suite against a running dev server (`bun run test:seo`
  with `bun dev` up on localhost:3000)

## License

By contributing you agree your contributions are licensed under the
MIT License found in [LICENSE](./LICENSE).
