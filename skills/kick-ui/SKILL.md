---
name: kick-ui
description: Find, install and use animated Web3/React components from the Kick UI shadcn registry. Use when the user mentions Kick UI or asks for wallet cards, deposit modals, trading charts, route trackers, venue selectors, NFT/vault carousels, or other animated onchain UI.
---

# Kick UI

Kick UI is a shadcn-compatible registry of animated React components for onchain products. Components install as source into the user's project; there is no runtime package.

## When to use

- The user mentions Kick UI, kickui.xyz, or one of its components.
- The user wants animated Web3 UI: wallet cards, deposit modals, trading charts, route trackers, venue selectors, NFT/vault carousels, or similar onchain interfaces.

## Discover components

Fetch live data before choosing a component; the list below may lag:

- `https://www.kickui.xyz/llms.txt` — compact index and setup guides.
- `https://www.kickui.xyz/llms-full.txt` — full docs in one file.
- `https://www.kickui.xyz/r/registry.json` — machine-readable registry index.
- `https://www.kickui.xyz/components/<slug>.md` — install command, dependencies, props, usage for one component.

Use slugs exactly as published. The live catalog is at `https://www.kickui.xyz/components`.

## Install

Requirements: a shadcn setup with Tailwind CSS v4, the `cn` util in `lib/utils.ts`, and `motion` plus any other package listed in the component's dependencies.

Install a component by URL (replace the example slug):

```bash
npx shadcn@latest add https://www.kickui.xyz/r/pill-button.json
```

For short names, add the documented namespace to `components.json`:

```json
{
  "registries": {
    "@kick-ui": "https://www.kickui.xyz/r/{name}.json"
  }
}
```

```bash
npx shadcn@latest add @kick-ui/pill-button
```

The documented namespace is `@kick-ui` (with a hyphen).

For MCP-based discovery and installation:

```bash
npx shadcn@latest mcp init
```

## Using the components

- Install only the dependencies listed on the component's markdown page; `motion` is needed where it is listed.
- Components inherit the host app's fonts — do not set fonts inside them.
- Use design tokens and semantic Tailwind classes, not hard-coded palette hexes; chain brand colors are the exception.
- Example names and addresses are fake demo data. Replace them with real data.
- Preserve the components' `prefers-reduced-motion` behavior for autoplaying or infinite animation.

## Components

Re-fetch `llms.txt` for the current list if a slug below is missing.

### Web3 Widgets

- `deposit-modal` — Accessible crypto deposit modal with token/network details and expiry handling.
- `route-tracker` — Live multi-hop swap/bridge route with animated connectors and a step timeline.
- `timeframe-tabs` — Scrollable chart timeframe tabs with an animated active state.
- `trading-chart` — Candlestick chart with live OHLCV, volume, crosshair and drawing tools.
- `venue-selector` — Animated multi-select for trading venues with keyboard navigation.

### Carousels

- `nft-carousel` — Coverflow carousel for NFT/meme-coin launches with autoplay, drag and bonding-curve progress.
- `stacked-carousel` — Auto-advancing card carousel with fly-up transitions that pause on hover/focus.
- `vault-carousel` — Draggable isometric feature cards with filters, detail panels and themes.
- `wave-carousel` — Hero with two endless rows of image tiles drifting in a sine wave.

### Cards

- `card-stack` — Overlapping cards that spread into a fan layout.
- `glyph-card` — Wallet card with drifting ASCII/pixel background, balance and copyable address.
- `holder-testimonials` — Expanding accordion of testimonials with keyboard and reduced-motion support.
- `pill-card` — Card with animated SVG paths and synchronized glow effects.
- `wallet-card` — Balance card with self-drawing 24h chart, rewards and cursor-following border.

### Buttons

- `pill-button` — Glass pill button with edge glow, hover shadow and press ripple.
- `slide-text-button` — Button with sliding text/icon and expanding hover or focus background.

### Text Animations

- `scramble-text` — Character scramble on hover with a decode sweep.
- `text-focus` — Hovered word sharpens while surrounding words blur.

### Backgrounds & Effects

- `cursor-web-fluid` — Cursor-following fluid effect with tunable color, trail and force.
- `perspective-grid` — Tilted chain grid with animated network cards and heading.
- `pixel-image` — Image reveal through a pixelated hover dissolve.

### Navigation & Lists

- `animated-list` — Animated list with keyboard navigation, auto-scroll and custom items.
- `mag-dock` — Spring-animated navigation dock with icons, tooltips and active states.

### Sections

- `feature-showcase` — Feature section with selectable content and synchronized visuals.
- `scroll-card` — Scroll-driven section with sticky cards, image transitions and text reveals.
