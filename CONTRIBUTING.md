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
   - Keep demo data in the demo wrapper (`src/components/demo/**`), not in
     the distributable source.

2. **Create a demo wrapper** under `src/components/demo/<Area>/<Name>.tsx`
   importing from `@registry/new-york/components/...` that renders a
   representative example.

3. **Register the demo key** in `src/components/docs/DemoRenderer.tsx`.
   The key must match the `demo:` frontmatter field in the next step.

4. **Write the docs page** at
   `content/components/<category>/<name>.mdx` with frontmatter:
   `title`, `description`, `category`, `demo`, `usage`, `props`.
   The build validates all of it (schema + demo-key resolution).

5. **Register the item** in `registry.json`: name, type
   `registry:component`, files path, and any extra `dependencies`
   (npm deps are otherwise auto-detected from imports by the build).

6. **Verify**: `bun docs:build && bun registry:build && bun lint &&
bun typecheck`. Generated outputs under `public/r/` and
   `src/generated/` must be committed.

## Checks performed on every PR

- ESLint (`bun lint`) and TypeScript strict (`bun typecheck`)
- Docs index freshness (`bun docs:check`)
- Registry output consistency (`bun registry:build` + git diff)
- MCP + SEO regression suites when the dev server is running (`bun run test`)

## License

By contributing you agree your contributions are licensed under the
MIT License found in [LICENSE](./LICENSE).
