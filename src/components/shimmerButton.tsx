"use client";

import { motion } from "motion/react";

export default function ShinyButton() {
    return (
        <>
            <style>{`
        .shiny-btn {
          --solid-color-background: 255, 255, 255;
          --radial-gradient-background: 0, 0, 0;
          --overlay-color: 0, 0, 0;
          background-color: rgba(var(--solid-color-background), 1);
          background-image: radial-gradient(
            circle at 50% 0%,
            rgba(var(--radial-gradient-background), 0.05) 0%,
            transparent 60%
          );
        }

        :is(.dark .shiny-btn) {
          --solid-color-background: 10, 10, 10;
          --radial-gradient-background: 255, 252, 255;
          --overlay-color: 255, 255, 255;
        }

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
      `}</style>

            <motion.button
                initial={{ "--x": "100%" } as any}
                animate={{ "--x": "-100%" } as any}
                whileTap={{ scale: 0.97 }}
                transition={{
                    repeat: Infinity,
                    repeatType: "loop",
                    repeatDelay: 1,
                    type: "tween",
                    ease: "linear",
                    duration: 2,
                }}
                className="shiny-btn relative overflow-hidden rounded-md border border-neutral-200 px-6 py-2 dark:border-neutral-800"
            >
                <span className="shiny-btn-mask relative block h-full w-full font-light tracking-wide text-neutral-950 dark:text-neutral-100">
                    Start now
                </span>

                <span className="shiny-btn-overlay pointer-events-none absolute inset-0 rounded-md p-px" />
            </motion.button>
        </>
    );
}