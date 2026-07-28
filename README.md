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
bun registry:build
bun run build
```

## Project structure

```text
src/app/                 Routes and documentation pages
src/components/demo/     Live component previews
src/components/ui/       App-local UI primitives
src/lib/component-registry.tsx
                         Documentation metadata and preview catalog
src/lib/component-categories.ts
                         Typed category definitions
registry/                Source distributed through the shadcn registry
public/r/                Generated registry JSON (do not edit manually)
```

## Adding a component

1. Add the distributable source under `registry/new-york/components/<name>/`.
2. Register it in `registry.json`.
3. Add its documentation metadata and preview to
   `src/lib/component-registry.tsx`.
4. Add it to the appropriate category in `src/config/Sidebar.tsx`.
5. Run `bun registry:build && bun typecheck && bun lint`.

## License

MIT
