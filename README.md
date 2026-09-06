# Kick UI

Kick UI is a shadcn-compatible React component library built with Next.js,
Tailwind CSS, Radix UI, and Motion. Components are accessible, customizable,
and installed as source code so you retain full ownership.

## Use a component

Install an individual component with the shadcn CLI:

```bash
npx shadcn@latest add https://kick-ui.vercel.app/r/shiny-button.json
```

Or browse the [documentation](https://kick-ui.vercel.app/docs) and component
catalog to find the install command for each component.

## Categories

- Buttons
- Cards
- Components
- Text animations
- Layouts and sections
- Animations

## Develop locally

```bash
bun install
bun dev
```

Useful checks:

```bash
bun lint
bun typecheck
bun run registry:check
bun test
bun registry:build
bun run build
```

## Project structure

```text
src/app/                 Routes and documentation pages
src/demos/               One live preview module per item (src/demos/<name>.tsx)
src/components/ui/       App-local UI primitives
src/lib/component-docs.ts
                         Reads docs + registry source at build time
src/lib/component-categories.ts
                         Generated category definitions (do not edit manually)
src/generated/           Generated docs index + demo map (do not edit manually)
scripts/lib/             Shared pipeline helpers (single source of truth)
registry/                Source distributed through the shadcn registry
public/r/                Generated registry JSON (do not edit manually)
```

## Adding a component

Identity is the filename: the registry name, doc filename, and demo
filename must all match (`<name>` below is one string in four places).

1. Add the distributable source under `registry/new-york/components/<name>/`.
2. Register it in `registry.json` (and `components.json` under
   `registries.kick-ui.items`).
3. Add `content/components/<category>/<name>.mdx` (no `demo` field; set
   `distributable: false` while a doc has no distributable source yet).
4. Add `src/demos/<name>.tsx` with a default export rendering the preview.
5. Run `bun registry:check`, then `bun registry:build && bun docs:build`,
   then `bun typecheck && bun lint && bun test`.

## License

MIT
