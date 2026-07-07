"use client";

import React, { useRef, useState, useEffect, useCallback, ReactNode } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

interface AnimatedListProps<T> {
  items: T[];
  renderItem: (
    item: T,
    index: number,
    isSelected: boolean,
    onMouseEnter: () => void,
    onClick: () => void,
    listRef: React.RefObject<HTMLDivElement | null>
  ) => ReactNode;
  className?: string;
}

export function AnimatedList<T>({ items, renderItem, className }: AnimatedListProps<T>) {
  const listRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [keyboardNav, setKeyboardNav] = useState<boolean>(false);

  // Performance Optimization: GPU Accelerated Scroll Gradients
  const { scrollYProgress } = useScroll({ container: listRef });
  const topGradientOpacity = useTransform(scrollYProgress, [0, 0.05], [0, 1]);
  const bottomGradientOpacity = useTransform(scrollYProgress, [0.95, 1], [1, 0]);

  const handleItemMouseEnter = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const handleItemClick = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || (e.key === "Tab" && !e.shiftKey)) {
        e.preventDefault();
        setKeyboardNav(true);
        setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1));
      } else if (e.key === "ArrowUp" || (e.key === "Tab" && e.shiftKey)) {
        e.preventDefault();
        setKeyboardNav(true);
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        if (selectedIndex >= 0 && selectedIndex < items.length) {
          e.preventDefault();
          handleItemClick(selectedIndex);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, handleItemClick, items.length]);

  useEffect(() => {
    if (!keyboardNav || selectedIndex < 0 || !listRef.current) return;
    const container = listRef.current;
    const selectedItem = container.querySelector(
      `[data-index="${selectedIndex}"]`
    ) as HTMLElement | null;

    if (selectedItem) {
      const extraMargin = 50;
      const containerScrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const itemTop = selectedItem.offsetTop;
      const itemBottom = itemTop + selectedItem.offsetHeight;
      if (itemTop < containerScrollTop + extraMargin) {
        container.scrollTo({ top: itemTop - extraMargin, behavior: "smooth" });
      } else if (itemBottom > containerScrollTop + containerHeight - extraMargin) {
        container.scrollTo({
          top: itemBottom - containerHeight + extraMargin,
          behavior: "smooth",
        });
      }
    }
    setKeyboardNav(false);
  }, [selectedIndex, keyboardNav]);

  return (
    <div className={cn("relative w-[500px]", className)}>
      <motion.div
        ref={listRef}
        className="w-full h-[500px] overflow-y-auto p-4 scrollbar-hide"
      >
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {renderItem(
              item,
              index,
              selectedIndex === index,
              () => handleItemMouseEnter(index),
              () => handleItemClick(index),
              listRef
            )}
          </React.Fragment>
        ))}
      </motion.div>

      {/* Top Gradient */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-12.5 bg-linear-to-b from-background to-transparent pointer-events-none transition-opacity duration-300 ease"
        style={{ opacity: topGradientOpacity }}
      ></motion.div>

      {/* Bottom Gradient */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-25 bg-linear-to-t from-background to-transparent pointer-events-none transition-opacity duration-300 ease"
        style={{ opacity: bottomGradientOpacity }}
      ></motion.div>
    </div>
  );
}
