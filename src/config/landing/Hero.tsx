import ReactIcon from "@/components/svgs/frameworks/React";
import NextJsIcon from "@/components/svgs/frameworks/NextJs";
import TailwindCss from "@/components/svgs/libraries/TailwindCss";
import Motion from "@/components/svgs/libraries/Motion";
import ShadcnIcon from "@/components/svgs/libraries/ShadcnIcon";
import { componentIndex } from "@/generated/component-index";

/**
 * Counted from the generated index rather than hardcoded, so the number can
 * never drift from what `registry:check` actually ships. Both builds fail on
 * an orphaned doc or registry item, so this always matches the real catalog.
 */
const componentCount = componentIndex.length - 1;

export const heroConfig = {
  badgeText: `${componentCount} components · MIT licensed`,

  title: {
    line1: "Your Ultimate UI Library For",
    line2: "Designing Faster. Shipping Smarter.",
  },

  description:
    `${componentCount}+ beautifully crafted, animated UI components built with ` +
    "React, Tailwind CSS, and Motion — installed as source code you own via the " +
    "shadcn CLI, ready to power your next website or product.",

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
      name: "Next.js",
      icon: NextJsIcon,
    },
    {
      name: "React",
      icon: ReactIcon,
    },
    {
      name: "Tailwind CSS",
      icon: TailwindCss,
    },
    {
      name: "shadcn/ui",
      icon: ShadcnIcon,
    },
    {
      name: "Motion",
      icon: Motion,
    },
  ],
} as const;
