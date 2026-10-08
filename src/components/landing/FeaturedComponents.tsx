"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowUpRight,
  Home,
  Mail,
  Trash2,
  Activity,
  XCircle,
} from "lucide-react";
import { componentIndex } from "@/generated/component-index";
import { getCategoryMetadata } from "@/lib/component-categories";
import { cn } from "@/lib/utils";

/**
 * Landing showcase of signature components.
 *
 * Every preview is the REAL registry source, dynamically imported so none of
 * it lands in the initial bundle. Props are landing-specific and deliberately
 * self-contained — no demo data, no remote CDN images, no network calls —
 * so the section renders offline and stays cheap.
 *
 * `cursor-web-fluid` (three.js) and `trading-chart` (live feed) are
 * deliberately excluded: a WebGL scene and a websocket on the landing page
 * would cost far more than they're worth above the fold.
 */
const ShinyButton = dynamic(() =>
  import("@registry/new-york/components/shiny-button/shiny-button").then(
    (m) => m.ShinyButton,
  ),
);
const ScrambleText = dynamic(
  () => import("@registry/new-york/components/scramble-text/scramble-text"),
);
const TextFocus = dynamic(
  () => import("@registry/new-york/components/text-focus/text-focus"),
);
const CardStack = dynamic(
  () => import("@registry/new-york/components/card-stack/card-stack"),
);
const MagDock = dynamic(
  () => import("@registry/new-york/components/mag-dock/mag-dock"),
);
const PixelImage = dynamic(
  () => import("@registry/new-york/components/pixel-image/pixel-image"),
);

const dockItems = [
  { id: 1, icon: Home, name: "Home", active: true },
  { id: 2, icon: Mail, name: "Mail", active: true },
  { id: 3, icon: XCircle, name: "Close" },
  { id: 4, icon: Trash2, name: "Trash" },
  { id: 5, icon: Activity, name: "Activity", active: true },
];

// Local placeholder art — CardStack's own defaults point at coingecko.
const stackItems = [
  {
    id: 1,
    name: "Card 1",
    image: "/assets/dummy/Card1.png",
    position: { x: -160, y: 8, rotate: -8 },
  },
  {
    id: 2,
    name: "Card 2",
    image: "/assets/dummy/Card2.png",
    position: { x: 160, y: 8, rotate: 8 },
  },
  {
    id: 3,
    name: "Card 3",
    image: "/assets/dummy/Card3.png",
    position: { x: -160, y: -14, rotate: -14 },
  },
  {
    id: 4,
    name: "Card 4",
    image: "/assets/dummy/Card4.png",
    position: { x: 160, y: -14, rotate: 14 },
  },
];

/** Title + category come from the generated index, never restated here. */
function meta(slug: string) {
  return componentIndex.find((entry) => entry.slug === slug)!;
}

interface ShowcaseItem {
  slug: string;
  /** Bento placement on the 6-column grid. */
  span: string;
  preview: React.ReactNode;
}

const showcase: ShowcaseItem[] = [
  {
    slug: "shiny-button",
    span: "lg:col-span-3",
    preview: (
      <ShinyButton duration={2.4} shimmerWidth={140}>
        Ship it
      </ShinyButton>
    ),
  },
  {
    slug: "scramble-text",
    span: "lg:col-span-3",
    preview: (
      <ScrambleText text="Design Faster" className="text-3xl md:text-4xl" />
    ),
  },
  {
    slug: "pixel-image",
    span: "lg:col-span-2",
    preview: (
      <PixelImage
        defaultImage="/assets/trafalgar.jpg"
        hoverImage="/assets/trafalgar1.jpg"
      />
    ),
  },
  {
    slug: "card-stack",
    span: "lg:col-span-2",
    preview: <CardStack items={stackItems} />,
  },
  {
    slug: "mag-dock",
    span: "lg:col-span-2",
    preview: <MagDock items={dockItems} />,
  },
  {
    slug: "text-focus",
    span: "lg:col-span-6",
    preview: (
      <TextFocus sentence="Every component ships as source code you own and can edit freely." />
    ),
  },
];

export default function FeaturedComponents() {
  return (
    <section className="w-full py-20" id="featured">
      {/* Section header */}
      <div className="mx-auto max-w-7xl px-4">
        <p className="text-primary text-sm font-medium">Featured Components</p>

        <h2 className="mt-2 max-w-3xl text-3xl leading-tight font-light md:text-5xl">
          Watch our <span className="font-medium">signature components</span>
        </h2>

        <p className="text-muted-foreground mt-4 max-w-2xl text-base md:text-lg">
          Try the newest interactive effects. Every preview below is the real
          component — hover, focus, and tap it, then copy the source.
        </p>
      </div>

      {/* Bento grid */}
      <div className="mx-auto mt-12 max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {showcase.map((item) => {
            const info = meta(item.slug);

            return (
              <Link
                key={item.slug}
                href={`/components/${item.slug}`}
                className={cn(
                  "group bg-card text-card-foreground relative flex min-h-[240px]",
                  "flex-col overflow-hidden rounded-2xl border p-6",
                  "transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
                  "focus-visible:ring-ring focus-visible:ring-[3px] focus-visible:outline-none",
                  item.span,
                )}
              >
                {/* Subtle grid pattern */}
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--foreground)_1px,transparent_1px),linear-gradient(to_bottom,var(--foreground)_1px,transparent_1px)] bg-[size:32px_32px] opacity-[0.04]" />

                {/* Live preview */}
                <div className="relative z-10 flex flex-1 items-center justify-center py-4">
                  {item.preview}
                </div>

                {/* Footer */}
                <div className="relative z-10 mt-6 flex items-end justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight">
                      {info.title}
                    </h3>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {getCategoryMetadata(info.category).label}
                    </p>
                  </div>

                  <ArrowUpRight
                    className="text-muted-foreground group-hover:text-primary h-5 w-5 shrink-0 transition-colors"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer CTA */}
        <div className="mt-10 flex justify-center">
          <Link
            href="/components"
            className={cn(
              "border-border text-foreground hover:bg-accent hover:text-accent-foreground",
              "inline-flex items-center gap-2 rounded-md border px-5 py-2.5 text-sm font-medium",
              "focus-visible:ring-ring transition-colors focus-visible:ring-[3px] focus-visible:outline-none",
            )}
          >
            Browse all components
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
