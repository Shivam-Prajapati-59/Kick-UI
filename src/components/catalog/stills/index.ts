import type { ComponentType } from "react";
import { AnimatedListStill } from "./AnimatedListStill";
import { CardStackStill } from "./CardStackStill";
import { CursorWebFluidStill } from "./CursorWebFluidStill";
import { DepositModalStill } from "./DepositModalStill";
import { FeatureShowcaseStill } from "./FeatureShowcaseStill";
import { PerspectiveGridStill } from "./PerspectiveGridStill";
import { PillCardStill } from "./PillCardStill";
import { PixelImageStill } from "./PixelImageStill";
import { ScrollCardStill } from "./ScrollCardStill";
import { TextFocusStill } from "./TextFocusStill";
import { TradingChartStill } from "./TradingChartStill";
import { VenueSelectorStill } from "./VenueSelectorStill";

export const stillPreviewComponents: Record<string, ComponentType> = {
  "card-stack": CardStackStill,
  "pill-card": PillCardStill,
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
