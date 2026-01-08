"use client";

import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ShinyButtonProps extends React.ComponentPropsWithoutRef<typeof Button> {
  shimmerWidth?: number;
  duration?: number;
}

const ShinyButton = React.forwardRef<HTMLButtonElement, ShinyButtonProps>(
  ({ className, children, duration = 2, ...props }, ref) => {
    return (
      <>
        <style jsx global>{`
          .shiny-btn-mask {
            mask-image: linear-gradient(
              -75deg,
              white calc(var(--x) + 20%),
              transparent calc(var(--x) + 30%),
              white calc(var(--x) + 100%)
            );
            -webkit-mask-image: linear-gradient(
              -75deg,
              white calc(var(--x) + 20%),
              transparent calc(var(--x) + 30%),
              white calc(var(--x) + 100%)
            );
          }

          .shiny-btn-overlay {
            background-image: linear-gradient(
              -75deg,
              rgba(var(--overlay-color), 0.1) calc(var(--x) + 20%),
              rgba(var(--overlay-color), 0.5) calc(var(--x) + 25%),
              rgba(var(--overlay-color), 0.1) calc(var(--x) + 100%)
            );
            mask: linear-gradient(black, black) content-box, linear-gradient(black, black);
            -webkit-mask: linear-gradient(black, black) content-box, linear-gradient(black, black);
            mask-composite: exclude;
            -webkit-mask-composite: xor;
          }

          :root {
            --shiny-btn-bg: 255, 255, 255;
            --shiny-btn-radial: 0, 0, 0;
            --overlay-color: 0, 0, 0;
          }

          .dark {
            --shiny-btn-bg: 10, 10, 10;
            --shiny-btn-radial: 255, 252, 255;
            --overlay-color: 255, 255, 255;
          }
        `}</style>

        <motion.div
          initial={{ "--x": "100%" } as any}
          animate={{ "--x": "-100%" } as any}
          transition={{
            repeat: Infinity,
            repeatType: "loop",
            repeatDelay: 1,
            type: "tween",
            ease: "linear",
            duration,
          }}
          className="inline-block"
        >
          <Button
            ref={ref}
            className={cn(
              "relative overflow-hidden transition-all duration-300 active:scale-[0.98]",
              "bg-[rgba(var(--shiny-btn-bg),1)] text-neutral-950 dark:text-neutral-100",
              "border border-neutral-200 dark:border-neutral-800",
              "hover:bg-[rgba(var(--shiny-btn-bg),0.9)]",
              "bg-[radial-gradient(circle_at_50%_0%,rgba(var(--shiny-btn-radial),0.05)_0%,transparent_60%)]",
              className
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
  }
);

ShinyButton.displayName = "ShinyButton";

export { ShinyButton };