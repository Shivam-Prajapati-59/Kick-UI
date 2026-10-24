/**
 * Single source of truth for site identity — used by metadata, JSON-LD,
 * sitemap, and robots.
 */

export const SITE_CONFIG = {
  name: "Kick UI",
  url: "https://www.kickui.xyz",
  tagline: "Beautifully animated React & Web3 UI components",
  description:
    "Kick UI is an open-source React component library for Web3 and modern apps — animated, accessible UI components installed as source code you own via the shadcn CLI.",
  keywords: [
    "react ui components",
    "shadcn ui",
    "animated components",
    "tailwind css components",
    "web3 ui components",
    "web3 react component library",
    "best react component library for web3",
    "crypto ui components",
    "defi dashboard components",
    "dapp ui kit",
    "web3 design system",
    "framer motion components",
    "next.js ui library",
    "open source react components",
    "copy paste components",
    "shadcn registry",
    "kick ui",
  ],
  github: "https://github.com/Shivam-Prajapati-59/Kick-UI",
  twitter: "https://x.com/Shivamp69_",
  twitterHandle: "@Shivamp69_",
} as const;

/**
 * Host without protocol, for display contexts (OG images).
 * Derived so a domain change touches only `url` above.
 */
export const SITE_HOST = SITE_CONFIG.url.replace(/^https?:\/\//, "");
