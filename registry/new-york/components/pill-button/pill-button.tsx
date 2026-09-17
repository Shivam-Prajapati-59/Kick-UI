"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Props for {@link PillButton}. Accepts every native `motion.button` prop
 * (including `children`, `className`, and `type`) except the animation
 * primitives the component owns (`initial`, `animate`, `transition`,
 * `whileHover`, `whileTap`, `variants`). Pointer/focus callbacks are chained
 * after the internal pressed, ripple, and glow updates. Extra `className`
 * values merge over the glass defaults.
 */
export type PillButtonProps = Omit<
  React.ComponentPropsWithoutRef<typeof motion.button>,
  | "children"
  | "initial"
  | "animate"
  | "transition"
  | "whileHover"
  | "whileTap"
  | "variants"
> & {
  /** Content rendered inside the pill — an icon, a label, or both. */
  children?: React.ReactNode;
};

/** Resting glass shadow — insets pinned to the left/right edges only. */
const REST_SHADOW =
  "0px 0px 24px rgba(0,0,0,0.08), " +
  "inset 5px 0px 12px -5px rgba(var(--glass-edge),0.1), " +
  "inset -5px 0px 12px -5px rgba(var(--glass-edge),0.1), " +
  "inset 2px 0px 4px 0px rgba(var(--glass-edge),0.06), " +
  "inset -2px 0px 4px 0px rgba(var(--glass-edge),0.06)";

/**
 * Hover glass shadow — the SAME 5 layers, pushed deeper and spread inward
 * so Motion can interpolate every number smoothly from REST_SHADOW.
 * (Layer count, order, and color format must stay identical.)
 */
const HOVER_SHADOW =
  "0px 0px 40px rgba(0,0,0,0.16), " +
  "inset 30px 0px 32px -12px rgba(var(--glass-edge),0.2), " +
  "inset -30px 0px 32px -12px rgba(var(--glass-edge),0.2), " +
  "inset 14px 0px 16px -6px rgba(var(--glass-edge),0.14), " +
  "inset -14px 0px 16px -6px rgba(var(--glass-edge),0.14)";

/**
 * Pressed glass shadow — same 5 layers, flattened and pulled tight so the
 * pill reads as being pushed *into* the glass rather than just shrinking.
 */
const PRESS_SHADOW =
  "0px 0px 8px rgba(0,0,0,0.12), " +
  "inset 3px 0px 8px -4px rgba(var(--glass-edge),0.08), " +
  "inset -3px 0px 8px -4px rgba(var(--glass-edge),0.08), " +
  "inset 1px 0px 3px 0px rgba(var(--glass-edge),0.05), " +
  "inset -1px 0px 3px 0px rgba(var(--glass-edge),0.05)";

/** Edge-light tint for the glass effect — dark in light mode, white in dark
 *  mode, so the shadows, glows, border, and ripples read identically on both.
 *  Same portable-`<style>` + `.dark`-flip pattern as `shiny-button`. */
const pillGlassCss = `
  .pill-glass-scope {
    --glass-edge: 0, 0, 0;
  }

  .dark .pill-glass-scope {
    --glass-edge: 255, 255, 255;
  }
`;

type Ripple = { id: number; x: number; y: number };

/** Edge glow strip — widens inward on hover (origin pinned to outer edge). */
function SideGlow({
  side,
  hovered,
}: {
  side: "left" | "right";
  hovered: boolean;
}) {
  return (
    <motion.span
      aria-hidden
      initial={false}
      animate={{ opacity: hovered ? 0.7 : 0.4, scaleX: hovered ? 1.7 : 1 }}
      transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
      className={cn(
        "pointer-events-none absolute inset-y-1.5 w-8 rounded-full blur-lg",
        side === "left"
          ? "left-1 origin-left bg-[linear-gradient(90deg,rgba(var(--glass-edge),0.12),rgba(var(--glass-edge),0))]"
          : "right-1 origin-right bg-[linear-gradient(270deg,rgba(var(--glass-edge),0.12),rgba(var(--glass-edge),0))]",
      )}
    />
  );
}

/**
 * An iOS-glass pill button — translucent theme surface with edge shadows
 * that expand inward on hover, a press state that flattens into the glass,
 * and a refraction ripple expanding from the exact press point. The edge
 * light adapts to the theme (dark edges on light glass, bright edges on
 * dark glass) so the effect reads the same in both modes.
 */
export function PillButton({
  className,
  type = "button",
  children,
  onHoverStart: onHoverStartProp,
  onHoverEnd: onHoverEndProp,
  onFocus: onFocusProp,
  onBlur: onBlurProp,
  onPointerDown: onPointerDownProp,
  onPointerUp: onPointerUpProp,
  onPointerLeave: onPointerLeaveProp,
  ...props
}: PillButtonProps) {
  const shouldReduceMotion = useReducedMotion();
  const [hovered, setHovered] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);
  const [ripples, setRipples] = React.useState<Ripple[]>([]);
  const rippleId = React.useRef(0);

  const addRipple = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (shouldReduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const id = rippleId.current++;
    setRipples((prev) => [
      ...prev,
      { id, x: e.clientX - rect.left, y: e.clientY - rect.top },
    ]);
  };

  const removeRipple = (id: number) => {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  };

  const glowUp = () => {
    if (!shouldReduceMotion) setHovered(true);
  };
  const glowDown = () => {
    setHovered(false);
    setPressed(false);
  };

  const currentShadow =
    pressed ? PRESS_SHADOW : hovered ? HOVER_SHADOW : REST_SHADOW;
  // Note: all shadow layers above are left/right-only (x-offset insets +
  // an offset-free ambient drop shadow) — no top/bottom shading.

  return (
    <div
      className="
        pill-glass-scope relative z-0 inline-flex rounded-full
        bg-[linear-gradient(90deg,rgba(var(--glass-edge),0.28),rgba(var(--glass-edge),0.05)_25%,rgba(var(--glass-edge),0.05)_75%,rgba(var(--glass-edge),0.28))]
        p-px
      "
    >
      <style dangerouslySetInnerHTML={{ __html: pillGlassCss }} />
      <motion.button
        type={type}
        onHoverStart={(event, info) => {
          glowUp();
          onHoverStartProp?.(event, info);
        }}
        onHoverEnd={(event, info) => {
          glowDown();
          onHoverEndProp?.(event, info);
        }}
        onFocus={(e) => {
          glowUp();
          onFocusProp?.(e);
        }}
        onBlur={(e) => {
          glowDown();
          onBlurProp?.(e);
        }}
        onPointerDown={(e) => {
          if (!shouldReduceMotion) setPressed(true);
          addRipple(e);
          onPointerDownProp?.(e);
        }}
        onPointerUp={(e) => {
          setPressed(false);
          onPointerUpProp?.(e);
        }}
        onPointerLeave={(e) => {
          setPressed(false);
          onPointerLeaveProp?.(e);
        }}
        initial={false}
        animate={{ boxShadow: currentShadow }}
        transition={{
          boxShadow: { duration: 0.35, ease: [0.32, 0.72, 0, 1] },
        }}
        className={cn(
          "relative isolate flex h-[68px] cursor-pointer items-center gap-2 overflow-hidden rounded-full",
          "bg-background/80 supports-[backdrop-filter]:bg-background/60 backdrop-blur-2xl",
          "px-5 py-2.5 pl-2.5",
          "text-base font-normal leading-6 text-foreground",
          "outline-none transition-colors",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          className,
        )}
        {...props}
      >
        <SideGlow side="left" hovered={hovered} />
        <SideGlow side="right" hovered={hovered} />
        {/* Refraction ripple — soft radial fill plus a slightly delayed
            bright ring, expanding from the exact press point like light
            bending through glass under the fingertip. */}
        <AnimatePresence>
          {ripples.map((r) => (
            <React.Fragment key={r.id}>
              <motion.span
                aria-hidden
                initial={{ opacity: 0.55, scale: 0 }}
                animate={{ opacity: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                onAnimationComplete={() => removeRipple(r.id)}
                transition={{ duration: 0.65, ease: [0.19, 1, 0.22, 1] }}
                style={{ left: r.x, top: r.y }}
                className="
                pointer-events-none absolute z-0 h-24 w-24 -translate-x-1/2 -translate-y-1/2
                rounded-full
                bg-[radial-gradient(circle,rgba(var(--glass-edge),0.35)_0%,rgba(var(--glass-edge),0.12)_35%,rgba(var(--glass-edge),0)_70%)]
              "
              />
              <motion.span
                aria-hidden
                initial={{ opacity: 0.5, scale: 0 }}
                animate={{ opacity: 0, scale: 1.4 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.75,
                  ease: [0.19, 1, 0.22, 1],
                  delay: 0.05,
                }}
                style={{ left: r.x, top: r.y }}
                className="
                pointer-events-none absolute z-0 h-16 w-16 -translate-x-1/2 -translate-y-1/2
                rounded-full border border-[rgba(var(--glass-edge),0.4)]
              "
              />
            </React.Fragment>
          ))}
        </AnimatePresence>

        <span className="relative z-10 flex items-center gap-2">
          {children}
        </span>
      </motion.button>
    </div>
  );
}

PillButton.displayName = "PillButton";

export default PillButton;
