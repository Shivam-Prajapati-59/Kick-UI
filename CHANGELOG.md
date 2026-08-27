# Changelog

All notable changes to Kick UI are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project
adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- **SEO system**: metadata templates with OpenGraph/Twitter cards and canonicals,
  dynamic branded OG images per page (`next/og`), JSON-LD structured data
  (WebSite, Organization, SoftwareApplication, BreadcrumbList), keyword sets,
  viewport theme-color, noindexed utility routes. Verified by a 24-case
  `tests/e2e/seo.mjs` suite; one-command regression via `bun run test`.
- **shadcn MCP compatibility**: Kick UI's public registry can be searched and
  installed through the official shadcn MCP server after consumers add the
  `@kick-ui` registry to their `components.json`.
- `feature-showcase` registered as a distributable registry component.
- Namespaced registry support: install via `npx shadcn add @kick-ui/<name>`
  after adding `"@kick-ui": "https://kick-ui.vercel.app/r/{name}.json"` to
  your `components.json`.
- MIT LICENSE file, CONTRIBUTING guide, commitlint + husky hooks,
  lint-staged, Dependabot config.
- SEO surfaces: `sitemap.ts`, `robots.ts`, branded `not-found.tsx`.

### Fixed

- `cursor-web-fluid` no longer blocks touch scrolling on mobile devices.
- `animated-list` no longer traps Tab/Shift+Tab keyboard focus.
- `stacked-carousel` distributed source now handles null items safely and
  pauses auto-advance on hover/focus; autoplay respects
  `prefers-reduced-motion`.
- `pill-card` glow now uses theme tokens — correct hue in light mode.
- `mag-dock` magnification no longer distorts when the page is scrolled.
- `slide-text-button` gained an accessible label, focus ring, and keyboard
  parity for its hover animation.

### Removed

- The custom `/api/mcp` server, its generated catalogue, and its SDK-specific
  test suite. The standard shadcn MCP server now provides agent access to the
  Kick UI registry.
- Dead app code (unused primitives, demo scratch files, unused SVG icons)
  and dead dependencies (`date-fns`, `figlet`, `shiki`,
  `rehype-pretty-code`, `@react-three/*`, `react-hook-form` stack, and more).
- Duplicate component sources under `src/components/ui` — the registry folder
  is now the single source of truth.
