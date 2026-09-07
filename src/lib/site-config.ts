/**
 * Single source of truth for site identity — used by metadata, JSON-LD,
 * sitemap, and robots.
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
  github: "https://github.com/Shivam-Prajapati-59/Kick-UI",
  twitter: "https://x.com/Shivamp69_",
  twitterHandle: "@Shivamp69_",
} as const;

/**
 * Host without protocol, for display contexts (OG images).
 * Derived so a domain change touches only `url` above.
 */
export const SITE_HOST = SITE_CONFIG.url.replace(/^https?:\/\//, "");
