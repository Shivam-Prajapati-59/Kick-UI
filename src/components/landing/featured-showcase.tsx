import * as React from "react";
import dynamic from "next/dynamic";
import { Home, Mail, Trash2, Activity, XCircle } from "lucide-react";

/**
 * PARKED — live component previews for the landing grid.
 *
 * The grid layout in `FeaturedComponents.tsx` is being finalised first, so
 * this file is temporarily unreferenced: the placeholders are in place and
 * these previews drop back in once the boxes are confirmed.
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
const PillButton = dynamic(() =>
  import("@registry/new-york/components/pill-button/pill-button").then(
    (m) => m.PillButton,
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

interface ShowcaseItem {
  slug: string;
  /** Bento placement on the 6-column grid. */
  span: string;
  preview: React.ReactNode;
}

export const showcase: ShowcaseItem[] = [
  {
    slug: "pill-button",
    span: "lg:col-span-3",
    preview: <PillButton>Ship it</PillButton>,
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
