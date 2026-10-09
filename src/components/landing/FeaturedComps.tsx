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
import StackedCarouselDemo from "@/demos/stacked-carousel";
import AnimatedListDemo from "@/demos/animated-list";
import PillButtonDemo from "@/demos/pill-button";


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

const SlideTextButton = dynamic(
  () =>
    import("@registry/new-york/components/slide-text-button/slide-text-button"),
);
const PillCard = dynamic(
  () => import("@registry/new-york/components/pill-card/pill-card"),
);

interface Box {
  /** Label — mirrors the source class name (div1, div2, div4, ...). */
  id: number;
  /** Grid placement in 1-based line numbers. */
  place: string;
  /** Token-only colour so each box reads as distinct in a screenshot. */
  color: string;
  /** Optional live component — renders in place of the number when set. */
  content?: React.ReactNode;
  /** Keep the outer frame (border + card surface) around live content. */
  framed?: boolean;
}

/**
 * 12 columns × 9 rows, 8px gaps. Tracks end exactly where content ends
 * (line 10) — no dead rows inside the background card.
 *
 * Wherever the source CSS sets an explicit start line this uses explicit
 * `col-start`/`col-end` instead of `col-span-*`: `col-span-*` emits the
 * `grid-column` shorthand, which also sets the start line, so mixing it with
 * `col-start-*` makes the result depend on stylesheet order rather than
 * authoring order. Boxes 1 and 10 are auto-placed in the source and have no
 * explicit start line, so they keep `col-span-*` with nothing to collide with.
 */

// Local placeholder art — CardStack's own defaults point at coingecko.
const stackItems = [
  {
    id: 1,
    name: "USDT",
    image: "https://assets.coingecko.com/coins/images/325/large/Tether.png",
    position: { x: -300, y: 12, rotate: -10 },
  },
  {
    id: 2,
    name: "BNB",
    image:
      "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png",
    position: { x: -180, y: -20, rotate: -6 },
  },
  {
    id: 3,
    name: "USDC",
    image: "https://assets.coingecko.com/coins/images/6319/large/usdc.png",
    position: { x: -60, y: 0, rotate: -2 },
  },
  {
    id: 4,
    name: "Solana",
    image: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
    position: { x: 60, y: 0, rotate: 2 },
  },
  {
    id: 5,
    name: "Ethereum",
    image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
    position: { x: 180, y: 4, rotate: 6 },
  },
  {
    id: 6,
    name: "Bitcoin",
    image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
    position: { x: 300, y: -5, rotate: 10 },
  },
];

const dockItems = [
  { id: 1, icon: Home, name: "Home", active: true },
  { id: 2, icon: Mail, name: "Mail", active: true },
  { id: 3, icon: XCircle, name: "Close" },
  { id: 4, icon: Trash2, name: "Trash" },
  { id: 5, icon: Activity, name: "Activity", active: true },
];

const boxes: Box[] = [
  {
    id: 1,
    place: "col-span-4 row-span-5",
    color: "border-primary/40 bg-primary/15 text-primary",
    content: (
      <PixelImage
        defaultImage="/assets/trafalgar.jpg"
        hoverImage="/assets/trafalgar1.jpg"
        className="max-h-[460px] w-full max-w-[460px]"
      />
    ),
  },
  {
    id: 2,
    place: "col-start-5 col-end-13 row-span-3",
    color: "border-info/40 bg-info/15 text-info",
    framed: false,
    content: <CardStack items={stackItems} />,
  },
  {
    id: 3,
    place: "col-start-5 col-end-7 row-start-4 row-end-6",
    color: "border-warning/40 bg-warning/15 text-warning",
    framed: false,
    content: (
      <div className="flex w-full justify-center">
        <div className="-translate-x-6">
          <div className="scale-[2.25]">
            <SlideTextButton />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 7,
    place: "col-start-6 col-end-9 row-start-4 row-end-6",
    color: "border-warning/40 bg-warning/15 text-warning",
    framed: false,
    content: (
      <div className="flex w-full justify-start">
        <div className="translate-x-26">
          <ScrambleText text="# Web3 " className="text-7xl font-bold" />
        </div>
      </div>
    ),
  },
  {
    id: 6,
    place: "col-start-8 col-end-13 row-start-4 row-end-10",
    color: "border-success/40 bg-success/15 text-success",
    framed: false,
    content: (
      <div className="-translate-y-15 translate-x-15">
        <AnimatedListDemo />
      </div>
    )
  },
  {
    id: 4,
    place: "col-start-1 col-end-6 row-start-6 row-end-8",
    color: "border-destructive/40 bg-destructive/15 text-destructive",
    framed: false,
    content: (
      <StackedCarouselDemo />
    ),
  },
  {
    id: 5,
    place: "col-start-5 col-end-9 row-start-5 row-end-10",
    color: "border-accent-foreground/40 bg-accent text-accent-foreground",
    content: (
      <div className="scale-95 mt-35 pl-8">
        <PillCard />
      </div>
    ),
  }
];

const FeaturedComps = () => {
  return (
    <section className="hidden min-[1440px]:block pb-12">
      {/* Section header */}
      <div className="mx-auto max-w-7xl px-4 text-center">
        <p className="text-primary text-sm font-medium">Featured Components</p>

        <h2 className="mx-auto mt-2 max-w-3xl text-3xl leading-tight font-light md:text-5xl">
          Watch our <span className="font-medium">signature components</span>
        </h2>

        <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-base md:text-lg">
          Try the newest interactive effects. Every preview below is the real
          component — hover, focus, and tap it, then copy the source.
        </p>
      </div>

      {/* Placement grid: 12 columns × 10 rows, 8px gaps */}
      <div className="relative mx-auto mt-12 max-w-full">
        <div className="bg-background relative grid h-[1060px] grid-cols-12 grid-rows-9 gap-2 rounded-2xl pb-6">
          {boxes.map((box) => (
            <div
              key={box.id}
              className={cn(
                `${box.place} flex items-center justify-center overflow-hidden rounded-xl`,
                box.content
                  ? box.framed
                    ? "border-border  border"
                    : "bg-transparent"
                  : `border ${box.color} text-lg font-semibold tabular-nums md:text-2xl`,
              )}
            >
              {box.content ?? box.id}
            </div>
          ))}
          {/* Interior dashed separators — inset so they never touch the outer border */}
          {/* 1. Centre vertical: between box 1 (cols 1-4) and box 2 (cols 5-12) */}
          <div
            aria-hidden
            className="border-border pointer-events-none absolute top-[3%] bottom-[46%] left-[33.1%] border-l border-dashed"
          />
          {/* 2. Top horizontal: below CardStack, above slide-text / scramble row */}
          <div
            aria-hidden
            className="border-border pointer-events-none absolute top-[32.5%] right-[1%] left-[33.1%] border-t border-dashed"
          />
          {/* 3. Middle vertical: between slide-text + scramble cluster and AnimatedList, running up */}
          <div
            aria-hidden
            className="border-border pointer-events-none absolute top-[32.5%] bottom-[3%] left-[66.4%] border-l border-dashed"
          />
          {/* 4. Mid horizontal: above StackedCarousel / PillCard, below slide + scramble */}
          <div
            aria-hidden
            className="border-border pointer-events-none absolute right-[33.7%] bottom-[46%] left-[1%] border-t border-dashed"
          />
        </div>
        {/* betweem Stakced Craosuel and pill card line  */}
        <div
          aria-hidden
          className="border-border pointer-events-none absolute top-[54.1%] bottom-[3%] left-[36.1%] border-l border-dashed"
        />

        {/* line between slidetext and scramble text  */}
        <div
          aria-hidden
          className="border-border pointer-events-none absolute top-[32.7%] bottom-[46%] left-[47%] border-l border-dashed"
        />
      </div>

      {/* Section footer — link to full catalog */}
      <div className="mt-10 flex justify-center">
        <Link
          href="/components"
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center justify-center gap-2 rounded-md px-6 text-sm font-medium transition-all"
        >
          View all components
          <ArrowUpRight className="size-4" />
        </Link>
      </div>
    </section>
  );
};

export default FeaturedComps;