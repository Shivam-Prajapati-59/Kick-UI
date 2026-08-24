/**
 * Single source of truth for site identity — used by metadata, JSON-LD,
 * sitemap, robots, and the MCP server instructions.
 */

export const SITE_CONFIG = {
  name: "Kick UI",
  url: "https://kick-ui.vercel.app",
  tagline: "Beautifully animated UI components for React",
  description:
    "A collection of beautifully designed, animated UI components for React. Accessible, customizable, open source — installed as source code you own via the shadcn CLI.",
  keywords: [
    "react ui components",
    "shadcn ui",
    "animated components",
    "tailwind css components",
    "framer motion components",
    "next.js ui library",
    "open source react components",
    "copy paste components",
    "shadcn registry",
    "kick ui",
  ],
  github: "https://github.com/shivambadmos/kick-ui",
  twitter: "https://x.com/shivambadmos",
  twitterHandle: "@shivambadmos",
} as const;
