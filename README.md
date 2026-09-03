<div align="center">

# Kick UI

**Beautifully animated UI components for React.**
Accessible · Customizable · Open Source — installed as source code you own.

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
| **Components**         | Venue Selector, Mag Dock, Timeframe Tabs, Stacked Carousel, Animated List |
| **Text Animations**    | Scramble Text, Text Focus                                 |
| **Animations**         | Cursor Web Fluid, Perspective Grid, Pixel Image           |
| **Layouts & Sections** | Scroll Card, Feature Showcase                             |

Browse live previews and copy-paste install commands at
[kick-ui.vercel.app/components](https://kick-ui.vercel.app/components).

## AI-ready with shadcn MCP

Kick UI is a shadcn-compatible registry, so it works with the official
[shadcn MCP server](https://ui.shadcn.com/docs/registry/mcp). Add the
`@kick-ui` registry to your project's `components.json` as shown above, then
configure the shadcn MCP server for your coding agent.

For example, with Codex add this to `~/.codex/config.toml`:

```toml
[mcp_servers.shadcn]
command = "npx"
args = ["shadcn@latest", "mcp"]
```

Restart your MCP client and ask it to search or install Kick UI components,
for example: _"Add @kick-ui/shiny-button to my project."_

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
bun registry:build && bun docs:build
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) to add a component. The `registry/` folder is the single source of truth; adding a component touches four files, and the build pipeline validates everything else.

## License

Distributed under the [MIT License](./LICENSE).
