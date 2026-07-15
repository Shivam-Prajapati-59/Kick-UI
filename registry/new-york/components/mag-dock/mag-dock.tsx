"use client";

import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";

export interface MagDockItem {
  id: number;
  icon: React.ElementType;
  name: string;
  active?: boolean;
  onClick?: () => void;
}

interface MagDockProps {
  items: MagDockItem[];
  className?: string;
}

function MagDockIcon({
  mouseX,
  icon: Icon,
  name,
  active,
  onItemClick,
}: {
  mouseX: MotionValue;
  icon: React.ElementType;
  name: string;
  active?: boolean;
  onItemClick?: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [hovered, setHovered] = useState(false);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const sizeSync = useTransform(
    distance,
    [-150, -75, 0, 75, 150],
    [40, 52, 72, 52, 40],
  );
  const size = useSpring(sizeSync, { mass: 0.1, stiffness: 200, damping: 14 });

  const liftSync = useTransform(size, [40, 72], [0, -14]);
  const lift = useSpring(liftSync, { mass: 0.1, stiffness: 200, damping: 14 });

  return (
    <div className="relative flex flex-col items-center">
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.9 }}
            transition={{ duration: 0.12 }}
            className="pointer-events-none absolute bottom-full mb-6 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md border border-border/50 bg-popover px-2 py-1 text-xs font-medium text-popover-foreground shadow-lg"
          >
            {name}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        ref={ref}
        type="button"
        title={name}
        aria-label={name}
        style={{ width: size, height: size, y: lift }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onClick={() => onItemClick?.()}
        whileTap={{ scale: 0.88 }}
        className={cn(
          "flex cursor-pointer items-center justify-center rounded-2xl",
          "bg-linear-to-b from-background/30 to-background/10 text-foreground",
          "shadow-[0_2px_8px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.2)]",
          "dark:shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]",
          "transition-colors hover:from-background/40 hover:to-background/15",
        )}
      >
        <Icon className="h-1/2 w-1/2" strokeWidth={1.75} />
      </motion.button>

      <span
        className={cn(
          "mt-1 h-1 w-1 rounded-full transition-opacity",
          active ? "bg-foreground/60 opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}

export default function MagDock({ items, className }: MagDockProps) {
  const mouseX = useMotionValue(Infinity);

  return (
    <div
      className={cn("flex w-full items-center justify-center p-10", className)}
    >
      <motion.div
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className={cn(
          "mx-auto flex h-16 items-end gap-2 rounded-2xl px-3 pb-2",
          "border border-border/40",
          "bg-background/70 backdrop-blur-2xl",
          "shadow-[0_8px_32px_rgba(0,0,0,0.12)]",
          "dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)]",
        )}
      >
        {items.map((item) => (
          <MagDockIcon
            key={item.id}
            mouseX={mouseX}
            icon={item.icon}
            name={item.name}
            active={item.active}
            onItemClick={item.onClick}
          />
        ))}
      </motion.div>
    </div>
  );
}
