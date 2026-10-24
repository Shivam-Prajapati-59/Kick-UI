/**
 * Single source of truth for site identity — used by metadata, JSON-LD,
 * sitemap, and robots.
 */

export const SITE_CONFIG = {
  name: "Kick UI",
  url: "https://www.kickui.xyz",
  tagline: "Animated React UI Components for Web3",
  description:
    "Explore animated React components for Web3 apps, wallets, and trading dashboards. Install editable Tailwind CSS source with the shadcn CLI.",
  github: "https://github.com/Shivam-Prajapati-59/Kick-UI",
  twitter: "https://x.com/Shivamp69_",
  twitterHandle: "@Shivamp69_",
} as const;

/**
 * Host without protocol, for display contexts (OG images).
 * Derived so a domain change touches only `url` above.
 */
export const SITE_HOST = SITE_CONFIG.url.replace(/^https?:\/\//, "");
