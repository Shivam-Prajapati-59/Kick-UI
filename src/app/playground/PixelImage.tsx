"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

const COLS = 10;
const ROWS = 10;
const TILE_COUNT = COLS * ROWS;
const WAVE_DURATION = 0.3;
const TILE_DURATION = 0.15;
const OVERLAP = 1;

function shuffledIndices(seed: number): number[] {
  let s = seed || 1;
  const arr = Array.from({ length: TILE_COUNT }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 16807) % 2147483647;
    const j = s % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const tiles = Array.from({ length: TILE_COUNT }, (_, i) => ({
  id: i,
  row: Math.floor(i / COLS),
  col: i % COLS,
}));

export default function PixelImage() {
  const [seed, setSeed] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const order = shuffledIndices(seed);
  const step = WAVE_DURATION / TILE_COUNT;

  const handleEnter = useCallback(() => {
    setSeed((s) => s + 1);
    setIsHovered(true);
  }, []);

  const handleLeave = useCallback(() => {
    setSeed((s) => s + 1);
    setIsHovered(false);
  }, []);

  const tileWidth = size.width / COLS;
  const tileHeight = size.height / ROWS;

  return (
    <div className="w-[500px] max-w-full">
      <div
        className="relative overflow-hidden rounded-2xl border p-3"
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        <div
          className="absolute inset-3 rounded-2xl"
          style={{
            backgroundImage: "url(/assets/trafalgar1.jpg)",
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
                  backgroundImage: "url(/assets/trafalgar.jpg)",
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
                        duration: TILE_DURATION,
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
