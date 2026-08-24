"use client";

import React from "react";
import {
  motion,
  useReducedMotion,
  type TargetAndTransition,
} from "motion/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface ShinyButtonProps extends React.ComponentProps<typeof Button> {
  shimmerWidth?: number;
  duration?: number;
}

/** Shared CSS for the shimmer mask/overlay. Plain <style> keeps the component
 *  portable across every React framework (not just Next.js styled-jsx). */
const shinyButtonCss = `
  .shiny-btn-mask {
    mask-image: linear-gradient(
      -75deg,
      white calc(var(--x) + 20%),
      transparent calc(var(--x) + 20% + var(--shimmer-width)),
      white calc(var(--x) + 100%)
    );
    -webkit-mask-image: linear-gradient(
      -75deg,
      white calc(var(--x) + 20%),
      transparent calc(var(--x) + 20% + var(--shimmer-width)),
      white calc(var(--x) + 100%)
    );
  }

  .shiny-btn-overlay {
    background-image: linear-gradient(
      -75deg,
      rgba(var(--overlay-color), 0.1) calc(var(--x) + 20%),
      rgba(var(--overlay-color), 0.5) calc(var(--x) + 20% + var(--shimmer-width) * 0.5),
      rgba(var(--overlay-color), 0.1) calc(var(--x) + 100%)
    );
    mask: linear-gradient(black, black) content-box, linear-gradient(black, black);
    -webkit-mask: linear-gradient(black, black) content-box, linear-gradient(black, black);
    mask-composite: exclude;
    -webkit-mask-composite: xor;
  }

  .shiny-btn-scope {
    --shiny-btn-bg: 255, 255, 255;
    --shiny-btn-radial: 0, 0, 0;
    --overlay-color: 0, 0, 0;
  }

  .dark .shiny-btn-scope {
    --shiny-btn-bg: 10, 10, 10;
    --shiny-btn-radial: 255, 252, 255;
    --overlay-color: 255, 255, 255;
  }
`;

type MotionCustomVars = TargetAndTransition & React.CSSProperties;

const ShinyButton = ({
  className,
  children,
  duration = 2,
  shimmerWidth = 100,
  ref,
  ...props
}: ShinyButtonProps) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: shinyButtonCss }} />

      <motion.div
        className="shiny-btn-scope inline-block"
        style={
          { "--shimmer-width": `${shimmerWidth}px` } as React.CSSProperties
        }
        initial={{ "--x": "100%" } as MotionCustomVars}
        animate={{ "--x": "-100%" } as MotionCustomVars}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : {
                repeat: Infinity,
                repeatType: "loop",
                repeatDelay: 1,
                type: "tween",
                ease: "linear",
                duration,
              }
        }
      >
        <Button
          ref={ref}
          className={cn(
            "relative overflow-hidden transition-all duration-300 active:scale-[0.98]",
            "bg-[rgba(var(--shiny-btn-bg),1)] text-neutral-950 dark:text-neutral-100",
            "border border-neutral-200 dark:border-neutral-800",
            "hover:bg-[rgba(var(--shiny-btn-bg),0.9)]",
            "bg-[radial-gradient(circle_at_50%_0%,rgba(var(--shiny-btn-radial),0.05)_0%,transparent_60%)]",
            className,
          )}
          {...props}
        >
          <span className="shiny-btn-mask relative block h-full w-full font-light tracking-wide">
            {children}
          </span>
          <span className="shiny-btn-overlay pointer-events-none absolute inset-0 rounded-[inherit] p-px" />
        </Button>
      </motion.div>
    </>
  );
};

ShinyButton.displayName = "ShinyButton";

export { ShinyButton };
