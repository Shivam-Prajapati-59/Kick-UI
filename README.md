<div align="center">

# Kick UI

**Beautifully animated UI components for React.**
Accessible · Customizable · Open Source — installed as source code you own.

[![CI](https://github.com/shivambadmos/kick-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/shivambadmos/kick-ui/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-8b5cf6.svg)](./LICENSE)
[![Built with shadcn CLI](https://img.shields.io/badge/install-shadcn%20CLI-0ea5e9.svg)](https://ui.shadcn.com/docs/cli)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8)](https://tailwindcss.com)

[Documentation](https://kick-ui.vercel.app/docs) · [Component Catalog](https://kick-ui.vercel.app/components) · [Report Bug](https://github.com/shivambadmos/kick-ui/issues)

</div>

---

## Install

One command per component — no package to install, you own the code:

```bash
npx shadcn@latest add https://kick-ui.vercel.app/r/shiny-button.json
```

Or add Kick UI as a namespace once, then use short names everywhere:

```bash
npx shadcn@latest add @kick-ui/shiny-button
```

```jsonc
// components.json
{
  "registries": {
    "@kick-ui": "https://kick-ui.vercel.app/r/{name}.json",
  },
}
```

Dependencies (npm packages and shadcn primitives) are resolved and installed automatically by the CLI.

## Components

| Category               | Highlights                                                |
| ---------------------- | --------------------------------------------------------- |
| **Buttons**            | Shiny Button, Slide Text Button                           |
| **Cards**              | Card Stack, Pill Card                                     |
| **Components**         | Mag Dock, Timeframe Tabs, Stacked Carousel, Animated List |
| **Text Animations**    | Scramble Text, Text Focus                                 |
| **Animations**         | Cursor Web Fluid, Perspective Grid, Pixel Image           |
| **Layouts & Sections** | Scroll Card, Feature Showcase                             |

Browse live previews and copy-paste install commands at
[kick-ui.vercel.app/components](https://kick-ui.vercel.app/components).

## AI-ready (MCP)

Kick UI ships a [Model Context Protocol](https://modelcontextprotocol.io) server so coding agents can discover, inspect, and install components autonomously:

```text
URL:   https://kick-ui.vercel.app/api/mcp
Tools: list_components · search_components · get_component · get_install_guide
```

Point Claude Desktop, Cursor, or any MCP client at the URL above and ask for _"a shiny button from Kick UI"_ — the agent receives props, usage, full source, and a working install command.

## Built with

React 19 · Next.js 16 · Tailwind CSS 4 · Motion · Radix UI · TypeScript (strict)

## Develop locally

```bash
bun install
bun dev          # docs site on localhost:3000
```

Useful checks:

```bash
bun lint         # ESLint
bun typecheck    # tsc --noEmit (strict)
bun test:mcp     # MCP regression suites (dev server must be running)
bun registry:build && bun docs:build
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) to add a component. The `registry/` folder is the single source of truth; adding a component touches four files, and the build pipeline validates everything else.

## License

Distributed under the [MIT License](./LICENSE).
