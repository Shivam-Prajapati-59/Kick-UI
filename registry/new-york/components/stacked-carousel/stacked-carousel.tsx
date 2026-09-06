"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface StackedCarouselProps<T> {
  /** Any data you want to render. One card per item. */
  items: T[];
  /** Renders the content of a single card. */
  renderItem: (item: T, index: number) => ReactNode;
  /** Milliseconds between automatic advances (default: 1800). */
  interval?: number;
  /** Duration in ms of the fly-up animation before the card cycles (default: 400). */
  advanceDelay?: number;
  /** Height of the stack container (default: 220). */
  containerHeight?: number;
  /** Called whenever the stack advances. */
  onAdvance?: (index: number) => void;
  /** Extra classes for the root wrapper. */
  className?: string;
  /** Extra classes applied to every card. */
  cardClassName?: string;
}

export function StackedCarousel<T>({
  items,
  renderItem,
  interval = 1800,
  advanceDelay = 400,
  containerHeight = 220,
  onAdvance,
  className,
  cardClassName = "",
}: StackedCarouselProps<T>) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAdvancingRef = useRef(false);
  const onAdvanceRef = useRef(onAdvance);
  const activeIndexRef = useRef(activeIndex);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    onAdvanceRef.current = onAdvance;
  }, [onAdvance]);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  const advanceStack = useCallback(() => {
    if (isAdvancingRef.current || items.length === 0) return;

    isAdvancingRef.current = true;
    setIsAdvancing(true);
    advanceTimer.current = setTimeout(() => {
      const nextIndex = (activeIndexRef.current + 1) % items.length;
      onAdvanceRef.current?.(nextIndex);
      setActiveIndex(nextIndex);
      isAdvancingRef.current = false;
      setIsAdvancing(false);
    }, advanceDelay);
  }, [items.length, advanceDelay]);

  useEffect(() => {
    // Respect prefers-reduced-motion and pause on hover/focus (WCAG 2.2.2).
    if (items.length < 2 || shouldReduceMotion || isPaused) return;
    const timer = window.setInterval(advanceStack, interval);
    return () => window.clearInterval(timer);
  }, [advanceStack, interval, items.length, shouldReduceMotion, isPaused]);

  useEffect(() => {
    return () => {
      if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    };
  }, []);

  if (items.length === 0) return null;

  const stackHeight = (items.length - 1) * 13 + 82;

  return (
    <div className={cn("w-full max-w-105 p-4", className)}>
      <div
        className="relative flex items-center justify-center"
        style={{ height: containerHeight }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
      >
        <div className="relative w-full" style={{ height: stackHeight }}>
          {items.map((item, index) => {
            const position =
              (index - activeIndex + items.length) % items.length;
            const isActive = position === 0;
            const itemKey =
              item != null && typeof item === "object" && "id" in item
                ? String((item as { id?: unknown }).id)
                : `index-${index}`;

            return (
              <motion.article
                key={itemKey}
                layout
                animate={{
                  y: isActive && isAdvancing ? [0, -100] : position * 13,
                  scale:
                    isActive && isAdvancing ? [1, 0.9] : 1 - position * 0.04,
                  opacity: 1,
                }}
                transition={
                  isActive && isAdvancing
                    ? { duration: 0.48, ease: "easeInOut" }
                    : { type: "spring", stiffness: 300, damping: 25 }
                }
                style={{ zIndex: items.length - position }}
                className={cn(
                  "border-border bg-card absolute inset-x-0 top-0 flex h-20.5 items-center justify-between overflow-hidden rounded-2xl border px-3 py-2 shadow-sm",
                  cardClassName,
                )}
                aria-current={isActive ? "true" : undefined}
              >
                {renderItem(item, index)}
              </motion.article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default StackedCarousel;
