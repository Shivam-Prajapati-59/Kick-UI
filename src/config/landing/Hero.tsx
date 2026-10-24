import ReactIcon from "@/components/svgs/frameworks/React";
import TailwindCss from "@/components/svgs/libraries/TailwindCss";
import Motion from "@/components/svgs/libraries/Motion";
import { componentIndex } from "@/generated/component-index";

/**
 * Counted from the generated index rather than hardcoded, so the number can
 * never drift from what `registry:check` actually ships. Both builds fail on
 * an orphaned doc or registry item, so this always matches the real catalog.
 */
const componentCount = componentIndex.length - 1;

export const heroConfig = {
  badgeLabel: "New",
  badgeText: "Trading Chart is Out",
  badgeHref: "/components/trading-chart",

  title: {
    line1: "Animated React UI for Web3",
    line2: "Build dapps that stand out.",
  },
  description:
    `${componentCount}+ open-source components for wallets, trading dashboards, and onchain apps. ` +
    "Install editable React source with the shadcn CLI, then make it your own.",

  cta: {
    primary: {
      label: "Browse Components",
      href: "/components",
    },
    secondary: {
      // `/templates` never existed — that CTA 404'd. The CLI guide is
      // the real next step after browsing.
      label: "Installation Guide",
      href: "/docs/cli",
    },
  },

  techStack: [
    {
      name: "React",
      icon: ReactIcon,
      // package.json: react 19.2.8
      version: "v19.2",
    },
    {
      name: "Tailwind CSS",
      icon: TailwindCss,
      // package.json: tailwindcss ^4.3.3 — reference shows major only
      version: "v4",
    },
    {
      name: "Motion",
      icon: Motion,
      // package.json: motion ^12.43.0
      version: "v12.43",
    },
  ],
} as const;
