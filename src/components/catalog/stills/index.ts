import type { ComponentType } from "react";
import { AnimatedListStill } from "./AnimatedListStill";
import { CardStackStill } from "./CardStackStill";
import { CursorWebFluidStill } from "./CursorWebFluidStill";
import { DepositModalStill } from "./DepositModalStill";
import { GlyphCardStill } from "./GlyphCardStill";
import { FeatureShowcaseStill } from "./FeatureShowcaseStill";
import { PerspectiveGridStill } from "./PerspectiveGridStill";
import { PillCardStill } from "./PillCardStill";
import { PixelImageStill } from "./PixelImageStill";
import { RouteTrackerStill } from "./RouteTrackerStill";
import { ScrollCardStill } from "./ScrollCardStill";
import { TextFocusStill } from "./TextFocusStill";
import { TradingChartStill } from "./TradingChartStill";
import { VenueSelectorStill } from "./VenueSelectorStill";
import { WalletCardStill } from "./WalletCardStill";

export const stillPreviewComponents: Record<string, ComponentType> = {
  "card-stack": CardStackStill,
  "pill-card": PillCardStill,
  "wallet-card": WalletCardStill,
  "glyph-card": GlyphCardStill,
  "route-tracker": RouteTrackerStill,
  "animated-list": AnimatedListStill,
  "deposit-modal": DepositModalStill,
  "feature-showcase": FeatureShowcaseStill,
  "perspective-grid": PerspectiveGridStill,
  "pixel-image": PixelImageStill,
  "scroll-card": ScrollCardStill,
  "trading-chart": TradingChartStill,
  "venue-selector": VenueSelectorStill,
  "cursor-web-fluid": CursorWebFluidStill,
  "text-focus": TextFocusStill,
};
