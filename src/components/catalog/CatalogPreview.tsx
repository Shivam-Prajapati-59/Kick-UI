"use client";

import { useEffect, useRef, useState } from "react";
import { demos, type DemoName } from "@/generated/demo-map";
import {
  compactPreviewComponents,
  previewStages,
  type PreviewStage,
} from "./previews";

type Stage = { width: number; height: number; maxScale: number };

// These demos use their real components, scaled as a whole so their layouts
// stay intact inside a catalog card. Controls remain interactive.
const stages: Partial<Record<DemoName, Stage>> = {
  "stacked-carousel": { width: 420, height: 230, maxScale: 0.72 },
};

function ScaledDemo({
  Demo,
  stage,
}: {
  Demo: React.ComponentType;
  stage: PreviewStage;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(stage.maxScale);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const measure = () => {
      setScale(
        Math.min(
          stage.maxScale,
          (frame.clientWidth - 16) / stage.width,
          (frame.clientHeight - 16) / stage.height,
        ),
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [stage]);

  return (
    <div ref={frameRef} className="relative size-full">
      <div
        className="absolute top-1/2 left-1/2 origin-center"
        style={{
          width: stage.width,
          height: stage.height,
          transform: `translate(-50%, -50%) scale(${scale})`,
        }}
      >
        <Demo />
      </div>
    </div>
  );
}

export function CatalogPreview({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [nearViewport, setNearViewport] = useState(false);
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    if (typeof IntersectionObserver === "undefined") {
      const frameId = window.requestAnimationFrame(() => setNearViewport(true));
      return () => window.cancelAnimationFrame(frameId);
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNearViewport(true);
        } else {
          setNearViewport(false);
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  const name = slug as DemoName;
  const Demo = compactPreviewComponents[name] ?? demos[name];
  const stage = previewStages[name];
  const needsActivation = name === "cursor-web-fluid";
  const showDemo = nearViewport && (!needsActivation || activated);

  return (
    <div
      ref={frameRef}
      className="relative flex size-full items-center justify-center overflow-hidden"
      onPointerEnter={needsActivation ? () => setActivated(true) : undefined}
    >
      {!showDemo && needsActivation && nearViewport ? (
        <button
          type="button"
          onClick={() => setActivated(true)}
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded-md px-4 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          Move or tap to preview the fluid effect
        </button>
      ) : null}
      {!showDemo && (!needsActivation || !nearViewport) ? (
        <span className="bg-muted/60 h-24 w-3/4 rounded-xl motion-safe:animate-pulse" aria-hidden="true" />
      ) : null}
      {showDemo && Demo ? (
        stage ? (
          <ScaledDemo Demo={Demo} stage={stage} />
        ) : (
          <div className="relative flex size-full items-center justify-center p-4">
            <Demo />
          </div>
        )
      ) : null}
      {!Demo && nearViewport ? (
        <span className="text-muted-foreground text-sm">{title} preview unavailable</span>
      ) : null}
    </div>
  );
}
