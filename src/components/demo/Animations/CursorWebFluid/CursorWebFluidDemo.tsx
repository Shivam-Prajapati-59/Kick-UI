"use client";

import CursorWebFluid from "@/components/demo/Animations/CursorWebFluid/CursorWebFluid";

/**
 * Contained demo — renders the fluid inside the preview box
 * instead of covering the full viewport.
 */
export default function CursorWebFluidDemo() {
  return (
    <div className="relative w-full h-full min-h-[350px] overflow-hidden rounded-xl bg-background">
      {/* Instructional label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 select-none">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          Move your cursor here
        </h1>
        <p className="mt-2 text-lg text-foreground">
          Experience the WebGL Fluid
        </p>
      </div>

      <CursorWebFluid
        contained
        inkColor="--background"
        blendMode="difference"
        dyeDissipation={0.97}
        velocityDissipation={0.97}
        curl={30}
        forceStrength={8}
        threshold={0.6}
        // edgeSoftness={0.3}
        zIndex={20}
      />
    </div>
  );
}
