import type { ComponentType } from "react";
import type { DemoName } from "@/generated/demo-map";
import { AnimatedListStill } from "./AnimatedListStill";

import { CardStackStill } from "./CardStackStill";
import { CursorWebFluidStill } from "./CursorWebFluidStill";
import { DepositModalStill } from "./DepositModalStill";
import { FolderCardStill } from "./FolderCardStill";
import { GlyphCardStill } from "./GlyphCardStill";
import { HolderTestimonialsStill } from "./HolderTestimonialsStill";
import { MagDockStill } from "./MagDockStill";
import { NftCarouselStill } from "./NftCarouselStill";
import { FeatureShowcaseStill } from "./FeatureShowcaseStill";
import { PerspectiveGridStill } from "./PerspectiveGridStill";
import { PillCardStill } from "./PillCardStill";
import { PixelImageStill } from "./PixelImageStill";
import { RouteTrackerStill } from "./RouteTrackerStill";
import { ScrollCardStill } from "./ScrollCardStill";
import { SnapSwapStill } from "./SnapSwapStill";
import { SwapPanelStill } from "./SwapPanelStill";
import { TextFocusStill } from "./TextFocusStill";
import { TradingChartStill } from "./TradingChartStill";
import { VaultCarouselStill } from "./VaultCarouselStill";
import { WaveCarouselStill } from "./WaveCarouselStill";
import { VenueSelectorStill } from "./VenueSelectorStill";
import { WalletCardStill } from "./WalletCardStill";

export const stillPreviewComponents: Partial<Record<DemoName, ComponentType>> =
  {
    "card-stack": CardStackStill,
    "pill-card": PillCardStill,
    "wallet-card": WalletCardStill,
    "folder-card": FolderCardStill,
    "glyph-card": GlyphCardStill,
    "holder-testimonials": HolderTestimonialsStill,
    "mag-dock": MagDockStill,
    "nft-carousel": NftCarouselStill,
    "route-tracker": RouteTrackerStill,
    "animated-list": AnimatedListStill,
    "deposit-modal": DepositModalStill,
    "feature-showcase": FeatureShowcaseStill,
    "perspective-grid": PerspectiveGridStill,
    "pixel-image": PixelImageStill,
    "scroll-card": ScrollCardStill,
    "trading-chart": TradingChartStill,
    "vault-carousel": VaultCarouselStill,
    "wave-carousel": WaveCarouselStill,
    "venue-selector": VenueSelectorStill,
    "swap-panel": SwapPanelStill,
    "snap-swap": SnapSwapStill,
    "cursor-web-fluid": CursorWebFluidStill,
    "text-focus": TextFocusStill,
  };
