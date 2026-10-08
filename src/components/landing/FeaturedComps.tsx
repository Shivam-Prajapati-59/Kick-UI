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
import { div } from "three/src/nodes/math/OperatorNode.js";
import { fa } from "zod/v4/locales";

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
        <div className="-translate-x-3">
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
        <div className="translate-x-22">
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
      <div className="-translate-y-20 -translate-x-0">
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
      <div className="scale-95 mt-18">
        <PillCard />
      </div>
    ),
  }
];

const FeaturedComps = () => {
  return (
    <section>
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

      {/* Placement grid: 12 columns × 10 rows, 8px gaps */}
      <div className="mx-auto mt-12 max-w-full">
        <div className="bg-background grid h-[960px] grid-cols-12 grid-rows-9 gap-2 rounded-2xl">
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
        </div>
      </div>
    </section>
  );
};

export default FeaturedComps;