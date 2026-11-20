/**
 * Single source of truth for site identity — used by metadata, JSON-LD,
 * sitemap, and robots.
 */

export const SITE_CONFIG = {
  name: "Kick UI",
  url: "https://www.kickui.xyz",
  tagline: "Animated Web3 UI you can copy, own, and ship.",
  description:
    "Kick UI is a shadcn-compatible registry of animated React components for onchain products — wallets, trading interfaces, vaults and dapps — with source you own.",
  github: "https://github.com/Shivam-Prajapati-59/Kick-UI",
  twitter: "https://x.com/Shivamp69_",
  twitterHandle: "@Shivamp69_",
} as const;

/**
 * Host without protocol, for display contexts (OG images).
 * Derived so a domain change touches only `url` above.
 */
export const SITE_HOST = SITE_CONFIG.url.replace(/^https?:\/\//, "");
