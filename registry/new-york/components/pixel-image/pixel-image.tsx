"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const OVERLAP = 1;

function shuffledIndices(n: number, seed: number): number[] {
  let s = seed || 1;
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 16807) % 2147483647;
    const j = s % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

interface PixelImageProps {
  defaultImage: string;
  hoverImage: string;
  cols?: number;
  rows?: number;
  waveDuration?: number;
  tileDuration?: number;
  className?: string;
}

export default function PixelImage({
  defaultImage,
  hoverImage,
  cols = 10,
  rows = 10,
  waveDuration = 0.3,
  tileDuration = 0.15,
  className,
}: PixelImageProps) {
  const tileCount = cols * rows;
  const [seed, setSeed] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const tiles = useMemo(
    () =>
      Array.from({ length: tileCount }, (_, i) => ({
        id: i,
        row: Math.floor(i / cols),
        col: i % cols,
      })),
    [tileCount, cols],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setSize({ width, height });
      setMounted(true);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const order = shuffledIndices(tileCount, seed);
  const step = waveDuration / tileCount;

  const handleEnter = useCallback(() => {
    setSeed((s) => s + 1);
    setIsHovered(true);
  }, []);

  const handleLeave = useCallback(() => {
    setSeed((s) => s + 1);
    setIsHovered(false);
  }, []);

  const tileWidth = size.width / cols;
  const tileHeight = size.height / rows;

  return (
    <div className={cn("w-[500px] max-w-full", className)}>
      <div
        className="relative overflow-hidden rounded-2xl border p-3"
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        <div
          className="absolute inset-3 rounded-2xl"
          style={{
            backgroundImage: `url(${hoverImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.2s",
          }}
        />

        <div
          ref={containerRef}
          className="relative aspect-square overflow-hidden rounded-2xl"
        >
          {tiles.map((tile, i) => {
            const x = tile.col * tileWidth;
            const y = tile.row * tileHeight;
            const fx = Math.floor(x);
            const fy = Math.floor(y);
            const w = Math.ceil(tileWidth) + OVERLAP;
            const h = Math.ceil(tileHeight) + OVERLAP;

            return (
              <motion.div
                key={tile.id}
                className="absolute"
                style={{
                  left: fx,
                  top: fy,
                  width: w,
                  height: h,
                  backgroundImage: `url(${defaultImage})`,
                  backgroundSize: `${size.width}px ${size.height}px`,
                  backgroundPosition: `${-fx}px ${-fy}px`,
                  backgroundRepeat: "no-repeat",
                  opacity: mounted ? undefined : 0,
                }}
                initial={false}
                animate={
                  !mounted
                    ? { opacity: 0 }
                    : isHovered
                      ? { opacity: 0 }
                      : { opacity: 1 }
                }
                transition={
                  !mounted
                    ? { duration: 0 }
                    : {
                        duration: tileDuration,
                        delay: order[i] * step,
                        ease: [0.33, 1, 0.68, 1],
                      }
                }
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
