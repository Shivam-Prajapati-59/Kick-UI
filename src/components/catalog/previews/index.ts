import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { DemoName } from "@/generated/demo-map";

export type PreviewStage = {
  width: number;
  height: number;
  maxScale: number;
};

export const compactPreviewComponents: Partial<
  Record<DemoName, ComponentType>
> = {
  "pill-button": dynamic(() => import("./PillButtonPreview")),
  "slide-text-button": dynamic(() => import("./SlideTextButtonPreview")),
  "scramble-text": dynamic(() => import("./ScrambleTextPreview")),
};

export const previewStages: Partial<Record<DemoName, PreviewStage>> = {
  "stacked-carousel": { width: 420, height: 230, maxScale: 0.72 },
};
