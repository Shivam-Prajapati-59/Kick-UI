"use client";

import dynamic from "next/dynamic";

const demos = {
  "shiny-button": dynamic(() =>
    import("@/components/demo/Components/ShinyButton").then((module) => ({
      default: () => <module.ShinyButton>Shiny Button</module.ShinyButton>,
    })),
  ),
  "cursor-web-fluid": dynamic(
    () =>
      import("@/components/demo/Animations/CursorWebFluid/CursorWebFluidDemo"),
  ),
  "scramble-text": dynamic(() =>
    import("@/components/demo/TextAnimations/ScrambleText").then((module) => ({
      default: () => <module.default text="Kick UI" />,
    })),
  ),
  "text-focus": dynamic(
    () => import("@/components/demo/TextAnimations/TextFocus"),
  ),
  "card-stack": dynamic(() => import("@/components/demo/Components/CardStack")),
  "slide-text-button": dynamic(
    () => import("@/components/demo/Components/SlideTextButton"),
  ),
  "mag-dock": dynamic(() => import("@/components/demo/Components/MagDock")),
  "perspective-grid": dynamic(
    () => import("@/components/demo/Components/PerspectiveGrid"),
  ),
  "pill-card": dynamic(() => import("@/components/demo/Components/PillCard")),
  "pixel-image": dynamic(
    () => import("@/components/demo/Components/PixelImage"),
  ),
  "animated-list": dynamic(
    () => import("@/components/demo/Components/AnimatedList"),
  ),
  "scroll-card": dynamic(
    () => import("@/components/demo/Components/ScrollCard"),
  ),
  "stacked-carousel": dynamic(
    () => import("@/components/demo/Components/StackedCarousel"),
  ),
  "timeframe-tabs": dynamic(
    () => import("@/components/demo/Components/TimeframeTabs"),
  ),
  "feature-showcase": dynamic(
    () => import("@/components/demo/Components/FeatureShowcase"),
  ),
} as const;

export type DemoName = keyof typeof demos;

export function DemoRenderer({ name }: { name: DemoName }) {
  const Demo = demos[name];
  if (!Demo) return null;
  return <Demo />;
}
