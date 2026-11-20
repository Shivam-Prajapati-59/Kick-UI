<div align="center">

<h1 align="center">
  <img src="./public/logo12.png" alt=KickUI" width="20%" height="20%" align="middle" />
</h1>

**Animated Web3 UI you can copy, own, and ship.**
Kick UI is a shadcn-compatible registry of animated React components for onchain products — wallets, trading interfaces, vaults and dapps — with source you own.

[![License: MIT](https://img.shields.io/badge/License-MIT-8b5cf6.svg)](./LICENSE)
[![Built with shadcn CLI](https://img.shields.io/badge/install-shadcn%20CLI-0ea5e9.svg)](https://ui.shadcn.com/docs/cli)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8)](https://tailwindcss.com)

[Website](https://www.kickui.xyz) · [Documentation](https://www.kickui.xyz/docs) · [Component Catalog](https://www.kickui.xyz/components) · [Report Bug](https://github.com/Shivam-Prajapati-59/Kick-UI/issues)

</div>

---

## Install

One command per component — no package to install, you own the code:

```bash
npx shadcn@latest add https://www.kickui.xyz/r/pill-button.json
```

Or add Kick UI as a namespace once, then use short names everywhere:

```bash
npx shadcn@latest add @kick-ui/pill-button
```

```jsonc
// components.json
{
  "registries": {
    "@kick-ui": "https://www.kickui.xyz/r/{name}.json",
  },
}
```

Dependencies (npm packages and shadcn primitives) are resolved and installed automatically by the CLI.

## Components

| Category                  | Components                                                                  |
| ------------------------- | --------------------------------------------------------------------------- |
| **Web3 Widgets**          | Deposit Modal, Route Tracker, Timeframe Tabs, Trading Chart, Venue Selector |
| **Carousels**             | NFT Carousel, Stacked Carousel, Vault Carousel, Wave Carousel               |
| **Cards**                 | Card Stack, Glyph Card, Holder Testimonials, Pill Card, Wallet Card         |
| **Buttons**               | Pill Button, Slide Text Button                                              |
| **Text Animations**       | Scramble Text, Text Focus                                                   |
| **Backgrounds & Effects** | Cursor Web Fluid, Perspective Grid, Pixel Image                             |
| **Navigation & Lists**    | Animated List, MagDock                                                      |
| **Sections**              | Feature Showcase, Scroll Card                                               |

Browse live previews and copy-paste install commands at
[kickui.xyz/components](https://www.kickui.xyz/components).

## AI-ready with shadcn MCP

Kick UI is a shadcn-compatible registry, so it works with the official
[shadcn MCP server](https://ui.shadcn.com/docs/mcp). Add the
`@kick-ui` registry to your project's `components.json` as shown above, then
configure the shadcn MCP server for your coding agent.

For example, with Codex add this to `~/.codex/config.toml`:

```toml
[mcp_servers.shadcn]
command = "npx"
args = ["shadcn@latest", "mcp"]
```

Restart your MCP client and ask it to search or install Kick UI components,
for example: _"Add @kick-ui/pill-button to my project."_

## Use with AI agents

Install the first-party skill so coding agents know how to find and install Kick UI:

```bash
npx skills add Shivam-Prajapati-59/Kick-UI
```

Agents can read `https://www.kickui.xyz/llms.txt` for the component index and
`https://www.kickui.xyz/components/<slug>.md` for per-component install commands,
dependencies, props and usage. The live registry is at `https://www.kickui.xyz/r/registry.json`.

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
bun run registry:check  # pipeline consistency, no writes
bun run test:unit       # pipeline unit tests (bun test)
bun registry:build && bun docs:build
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) to add a component. Identity is
the filename: the registry name, doc filename, and demo filename must all
match, and the build pipeline validates everything else.

## License

Distributed under the [MIT License](./LICENSE).
