# Kick UI ideas and roadmap

Parked ideas so they are not forgotten. Source: market research run on
2026-11-20 (four research agents: competitor libraries, Web3 UI gaps,
carousels, distribution). Move an item to "Done" with a date when it ships.

## Positioning (agreed)

- Own "animated Web3 UI for real product screens": wallets, trading,
  deposits, tx status. Not landing-page effects.
- Tagline: "Animated Web3 UI you can copy, own, and ship."
- Gap in the market: wallet SDKs (RainbowKit, ConnectKit, Reown, thirdweb)
  are wallet-coupled and not animated; animated libraries (Aceternity, Magic
  UI, React Bits, Cult UI) have no Web3 components; Coinbase OnchainKit is
  deprecated; `@onchain-ui` (closest shadcn registry) is static and
  wagmi-coupled.

## This week (in progress)

- [ ] Show the homepage Featured Components at every width (hidden below
      1440px in `src/components/landing/FeaturedComps.tsx`). The owner is
      designing this grid (agent version reverted 2026-11-20).
- [x] (2026-11-20) Category reshuffle: Web3 Widgets first, Carousels (nft, vault,
      stacked, wave), Cards, Buttons, Text Animations, Backgrounds & Effects,
      Navigation & Lists, Sections. holder-testimonials is an accordion, not
      a carousel.
- [x] (2026-11-20) New tagline in hero, metadata and README.
- [x] (2026-11-20) Open Graph images from real component screenshots.

## Agent discoverability (in progress)

- [x] Agent-readiness audit of kickui.xyz (2026-11-20). Findings to fix:
  - [x] (2026-11-20) Markdown twins for component and guide pages
        (`text/markdown`). Unknown slugs still 500 in production until
        commit b39b4ea is pushed and deployed.
  - [x] Add `/llms-full.txt`; link it, `/r/registry.json` and the MCP
        command from `/llms.txt`.
  - [ ] `robots.ts`: explicit rules for AI search bots (OAI-SearchBot,
        Claude-SearchBot, PerplexityBot); decide on training bots (GPTBot,
        ClaudeBot, Google-Extended) separately (owner decision).
  - [x] Sitemap: llms.txt, llms-full.txt (registry.json left out on purpose).
  - [x] "Open in v0" link on component pages.
  - [x] Homepage `SoftwareApplication` JSON-LD.
  - [x] Remove the empty `src/app/api/mcp/` folder (shadcn MCP already
        works with our registry; no custom server needed).
  - [x] README: current shadcn MCP docs link and exact install commands.
  - Third-party discoverability skills reviewed: install none.
- [ ] Publish our own Kick UI agent skill (written at `skills/kick-ui/SKILL.md`;
      goes live once pushed; then list it on skills.sh) so agents know how to install
      and use our components.
- [ ] Get listed in the shadcn registry directory (agents using the shadcn
      MCP find registries there).

## Shipped since

- [x] (2026-11-21) Catalog stills redone to match the real components
      (wave, vault, scroll card, trading chart, route tracker, glyph card,
      mag dock, text focus, cursor fluid, wallet card, feature showcase).
- [x] (2026-11-21) New component: Folder Card (cards), three Web3 demo cards.

## Next 2-4 weeks

- [ ] New components (props-driven, work with any wallet library, no wagmi
      coupling):
  - [ ] Transaction status tracker (pending, confirmed, failed, explorer
        link, retry).
  - [ ] Token picker (search, balances, icons, multi-chain).
  - [ ] Swap panel (amount fields, token picker, price impact, slippage,
        route).
- [ ] Product states as our signature: loading, empty, error,
      wallet-disconnected and insufficient-balance variants, documented, on
      the existing Web3 widgets first (wallet-card, deposit-modal,
      route-tracker, venue-selector, trading-chart).
- [ ] Stacked carousel: drag-to-throw with the NFT carousel's physics
      (1:1 drag, velocity projection, springs).
- [ ] Get listed in the shadcn registry index; add `llms.txt` (leaders also
      ship MCP / agent skills).

## Then: launch

- X thread with a 30-45s demo video, Product Hunt, pitches to This Week in
  React and React Status. Only after the "this week" visual fixes are live.

## Later / maybe

- More Web3 widgets from the gap list: animated wallet-connect button
  states, NFT mint card, chain/network selector, portfolio asset row,
  staking/vault position, address identity (ENS) display.
- Use-case collections ("Wallets & accounts", "Trading & data", "Onchain
  flows") as a second way to browse.
- Opt-in pause control for autoplaying carousels (WCAG 2.2.2); the owner
  removed the always-on Pause/Play button from the NFT carousel.
- Revisit a paid Pro tier at around 60 components.

## Decided against (for now)

- A generic shadcn/Embla-style `Carousel` (competes with Embla, blurs the
  Web3 positioning).
- Broad "best React component library" SEO; target Web3 component keywords
  instead.
- A new sidebar section for every pattern family.
