"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export type WaveCarouselItem = {
  image: string;
  title: string;
  href?: string;
  fit?: "cover" | "contain";
  background?: string;
  pixelated?: boolean;
};

export type WaveCarouselProps = {
  items: WaveCarouselItem[];
  heading?: string;
  description?: string;
  tileSize?: number;
  gap?: number;
  speed?: number;
  amplitude?: number;
  headingBreak?: number;
  className?: string;
};

const DEFAULT_TILE = 122;
const DEFAULT_GAP = 12;
const DEFAULT_SPEED = 28;
const DEFAULT_AMP = 28;
const FREQUENCY = 0.012;
const WAVE_SPEED = 0.6;

const mod = (n: number, m: number) => ((n % m) + m) % m;

type TileInstance = {
  row: 0 | 1;
  index: number; // position slot in row
  itemIndex: number;
  isDup: boolean;
};

export default function WaveCarousel({
  items,
  heading,
  description,
  tileSize = DEFAULT_TILE,
  gap = DEFAULT_GAP,
  speed = DEFAULT_SPEED,
  amplitude = DEFAULT_AMP,
  headingBreak,
  className,
}: WaveCarouselProps) {
  const reduce = useReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const topRowRef = useRef<HTMLDivElement | null>(null);
  const bottomRowRef = useRef<HTMLDivElement | null>(null);
  const tileRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [size, setSize] = useState({ w: 0, h: 0 });
  const [entered, setEntered] = useState(false);

  const half = Math.max(1, Math.ceil(items.length / 2));
  const topItems = items.slice(0, half);
  const bottomItems = items.slice(half);

  const smallTile = Math.round(tileSize * (84 / 122));
  const tile = size.w > 0 && size.w < 640 ? smallTile : tileSize;
  const radius = tile * 0.11;

  // Build tile instances per row based on current width.
  const buildInstances = (
    row: 0 | 1,
    rowItems: WaveCarouselItem[],
    width: number,
  ) => {
    const len = rowItems.length;
    if (len === 0 || width === 0) return [] as TileInstance[];
    const tw = tile + gap;
    const copies = Math.max(1, Math.ceil((width + 2 * tw) / (len * tw)));
    const count = len * copies;
    const inst: TileInstance[] = [];
    for (let k = 0; k < count; k++) {
      inst.push({
        row,
        index: k,
        itemIndex: k % len,
        isDup: k >= len,
      });
    }
    return inst;
  };

  const topInstances = buildInstances(0, topItems, size.w);
  const bottomInstances = buildInstances(1, bottomItems, size.w);

  const topOffsetRef = useRef(0);
  const bottomOffsetRef = useRef(0);
  const vTopRef = useRef(0);
  const vBottomRef = useRef(0);
  const draggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartTopRef = useRef(0);
  const dragStartBottomRef = useRef(0);
  const movedRef = useRef(0);
  const visibleRef = useRef(false);
  const hiddenRef = useRef(false);
  const lastTimeRef = useRef<number | null>(null);
  const phaseRef = useRef(0);
  const hoverRef = useRef(0);
  const hoverTargetRef = useRef(0);
  const pointerSamplesRef = useRef<{ x: number; t: number }[]>([]);

  // ResizeObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      const r = entries[0]?.contentRect;
      if (r) setSize({ w: r.width, h: r.height });
    });
    obs.observe(el);
    const r = el.getBoundingClientRect();
    setSize({ w: r.width, h: r.height });
    return () => obs.disconnect();
  }, []);

  // IntersectionObserver for off-screen pause + entrance
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const v = entries[0]?.isIntersecting ?? false;
        visibleRef.current = v;
        if (v && !entered) setEntered(true);
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [entered]);

  // tab hidden
  useEffect(() => {
    const onVis = () => {
      hiddenRef.current = document.hidden;
    };
    document.addEventListener("visibilitychange", onVis);
    hiddenRef.current = document.hidden;
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // rAF loop
  useEffect(() => {
    let raf = 0;
    const loop = (now: number) => {
      if (lastTimeRef.current == null) lastTimeRef.current = now;
      const dt = Math.min(0.05, (now - lastTimeRef.current) / 1000);
      lastTimeRef.current = now;
      const dtMs = dt * 1000;

      hoverRef.current +=
        (hoverTargetRef.current - hoverRef.current) *
        (1 - Math.pow(0.99, dtMs));

      if ((!visibleRef.current || hiddenRef.current) && !draggingRef.current) {
        raf = requestAnimationFrame(loop);
        return;
      }

      const w = size.w;
      if (w > 0 && !draggingRef.current) {
        const cruise =
          reduce || !visibleRef.current || hiddenRef.current
            ? 0
            : speed * (1 - hoverRef.current);
        const k = 1 - Math.pow(0.998, dtMs);
        vTopRef.current += (cruise - vTopRef.current) * k;
        vBottomRef.current += (-cruise - vBottomRef.current) * k;
        topOffsetRef.current += vTopRef.current * dt;
        bottomOffsetRef.current += vBottomRef.current * dt;
      }

      if (!reduce) {
        phaseRef.current += dt * WAVE_SPEED * (1 - hoverRef.current);
      }
      const phase = phaseRef.current;

      const topRow = topRowRef.current;
      const botRow = bottomRowRef.current;
      if (topRow && topInstances.length > 0) {
        const topSpan = topInstances.length * (tile + gap);
        topOffsetRef.current = mod(topOffsetRef.current, topSpan);
        topInstances.forEach((inst, i) => {
          const node = tileRefs.current[i];
          if (!node) return;
          const x =
            mod(inst.index * (tile + gap) + topOffsetRef.current, topSpan) -
            (tile + gap);
          const y =
            -tile / 2 +
            (reduce ? 0 : amplitude * Math.sin(x * FREQUENCY + phase));
          node.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        });
      }
      if (botRow && bottomInstances.length > 0) {
        const botSpan = bottomInstances.length * (tile + gap);
        bottomOffsetRef.current = mod(bottomOffsetRef.current, botSpan);
        const baseIdx = topInstances.length;
        bottomInstances.forEach((inst, i) => {
          const node = tileRefs.current[baseIdx + i];
          if (!node) return;
          const x =
            mod(inst.index * (tile + gap) + bottomOffsetRef.current, botSpan) -
            (tile + gap);
          const y =
            -tile / 2 +
            (reduce ? 0 : amplitude * Math.sin(x * FREQUENCY + phase));
          node.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        });
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    size.w,
    size.h,
    tile,
    gap,
    speed,
    amplitude,
    reduce,
    topItems.length,
    bottomItems.length,
    topInstances.length,
    bottomInstances.length,
    entered,
  ]);

  const handlePointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartTopRef.current = topOffsetRef.current;
    dragStartBottomRef.current = bottomOffsetRef.current;
    movedRef.current = 0;
    pointerSamplesRef.current = [{ x: e.clientX, t: performance.now() }];
    vTopRef.current = 0;
    vBottomRef.current = 0;
    containerRef.current?.classList.add("cursor-grabbing");
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    if (e.buttons === 0) {
      // Released outside the root before the drag captured the pointer.
      draggingRef.current = false;
      containerRef.current?.classList.remove("cursor-grabbing");
      return;
    }
    const delta = e.clientX - dragStartXRef.current;
    movedRef.current = Math.max(movedRef.current, Math.abs(delta));
    // Capture only once it is a drag, so a plain tap still clicks the tile link.
    if (
      movedRef.current > 5 &&
      !e.currentTarget.hasPointerCapture(e.pointerId)
    ) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {}
    }
    topOffsetRef.current = dragStartTopRef.current + delta;
    bottomOffsetRef.current = dragStartBottomRef.current + delta;
    const t = performance.now();
    const samples = pointerSamplesRef.current;
    samples.push({ x: e.clientX, t });
    while (samples.length > 0 && t - samples[0].t > 100) samples.shift();
  };
  const handlePointerUp = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    const samples = pointerSamplesRef.current;
    const newest = samples[samples.length - 1];
    const oldest = samples[0];
    let v = 0;
    if (
      newest &&
      oldest &&
      newest.t > oldest.t &&
      performance.now() - newest.t <= 60
    ) {
      v = ((newest.x - oldest.x) / (newest.t - oldest.t)) * 1000;
    }
    v = reduce ? 0 : Math.max(-4000, Math.min(4000, v));
    vTopRef.current = v;
    vBottomRef.current = v;
    pointerSamplesRef.current = [];
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    containerRef.current?.classList.remove("cursor-grabbing");
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    // detail 0 = keyboard activation; never block it because of an old drag.
    if (e.detail > 0 && movedRef.current > 5) {
      e.preventDefault();
      e.stopPropagation();
    }
    movedRef.current = 0;
  };

  // Pause while a tile is hovered or focused; resume only when neither applies.
  const pauseRef = useRef({ hover: false, focus: false });
  const setPause = (reason: "hover" | "focus", on: boolean) => {
    pauseRef.current[reason] = on;
    hoverTargetRef.current =
      pauseRef.current.hover || pauseRef.current.focus ? 1 : 0;
  };
  const handleTilePointerEnter = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") setPause("hover", true);
  };
  const handleTilePointerLeave = () => setPause("hover", false);
  const handleTileFocus = () => setPause("focus", true);
  const handleTileBlur = () => setPause("focus", false);

  const words = (heading ?? "").split(" ").filter(Boolean);

  const renderTile = (
    inst: TileInstance,
    rowItems: WaveCarouselItem[],
    baseIndex: number,
    i: number,
  ) => {
    const item = rowItems[inst.itemIndex];
    if (!item) return null;
    const isDup = inst.isDup;
    const tag = item.href ? "a" : "div";
    const Component = tag as React.ElementType;
    return (
      <div
        key={`${inst.row}-${inst.index}`}
        ref={(el) => {
          tileRefs.current[baseIndex + i] = el;
        }}
        className="absolute top-0 left-0 z-[1] will-change-transform focus-within:z-10 hover:z-10"
        style={{ width: tile, height: tile }}
        aria-hidden={isDup ? true : undefined}
      >
        <motion.div
          className="h-full w-full"
          initial={reduce ? false : { opacity: 0, y: 22, scale: 0.82 }}
          animate={
            entered
              ? { opacity: 1, y: 0, scale: 1 }
              : reduce
                ? { opacity: 1, y: 0, scale: 1 }
                : { opacity: 0, y: 22, scale: 0.82 }
          }
          transition={{
            duration: 1,
            ease: [0.16, 1, 0.3, 1],
            delay: reduce ? 0 : i * 0.03,
          }}
        >
          <Component
            href={item.href}
            aria-label={item.href ? item.title : undefined}
            tabIndex={isDup ? -1 : undefined}
            className={cn(
              "group relative isolate block h-full w-full outline-none",
              "transition-transform duration-[0.6s] ease-[cubic-bezier(0.16,1,0.3,1)]",
              "hover:-translate-y-1.5 hover:scale-[1.04] focus-visible:-translate-y-1.5 focus-visible:scale-[1.04]",
              "active:scale-[0.97] active:duration-100",
              "motion-reduce:translate-none motion-reduce:scale-none",
              "focus-visible:ring-foreground/40 focus-visible:ring-2",
            )}
            onClickCapture={handleClickCapture}
            onPointerEnter={handleTilePointerEnter}
            onPointerLeave={handleTilePointerLeave}
            onFocus={handleTileFocus}
            onBlur={handleTileBlur}
          >
            <div
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute -z-10 rounded-[inherit] opacity-50 blur-xl saturate-150 transition-opacity duration-[0.9s] ease-[cubic-bezier(0.16,1,0.3,1)] select-none group-hover:opacity-75",
                item.fit === "contain"
                  ? "inset-[21%] h-[58%] w-[58%] scale-150"
                  : "inset-0 h-full w-full scale-110",
              )}
              style={{ background: item.background }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image}
                alt=""
                aria-hidden="true"
                draggable={false}
                loading="lazy"
                decoding="async"
                className={cn(
                  "h-full w-full select-none",
                  item.fit === "contain" ? "object-contain" : "object-cover",
                )}
              />
            </div>
            <div
              className={cn(
                "absolute inset-0 overflow-hidden shadow-[0_1px_2px_rgb(0_0_0/0.06),0_10px_22px_-12px_rgb(0_0_0/0.28)]",
                item.fit === "contain" && "flex items-center justify-center",
              )}
              style={{
                borderRadius: radius,
                background: item.background ?? "var(--card)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image}
                alt={item.href ? "" : item.title}
                draggable={false}
                loading="lazy"
                decoding="async"
                className={cn(
                  "transition-transform duration-[0.9s] ease-[cubic-bezier(0.16,1,0.3,1)] group-focus-within:scale-[1.08] group-hover:scale-[1.08] group-focus:scale-[1.08] motion-reduce:scale-none",
                  item.pixelated && "[image-rendering:pixelated]",
                  item.fit === "contain"
                    ? "h-[58%] w-[58%] object-contain"
                    : "h-full w-full object-cover",
                )}
              />
            </div>
          </Component>
        </motion.div>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-full min-h-[420px] w-full cursor-grab overflow-hidden select-none",
        className,
      )}
      style={{ touchAction: "pan-y" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* tile layer with mask */}
      <div
        className="absolute inset-0 z-10"
        style={{
          maskImage:
            "linear-gradient(90deg, transparent 0%, #000 10%, #000 90%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent 0%, #000 10%, #000 90%, transparent 100%)",
        }}
      >
        <div ref={topRowRef} className="absolute top-[22%] right-0 left-0 h-0">
          {topInstances.map((inst, i) => renderTile(inst, topItems, 0, i))}
        </div>
        <div
          ref={bottomRowRef}
          className="absolute top-[78%] right-0 left-0 h-0"
        >
          {bottomInstances.map((inst, i) =>
            renderTile(inst, bottomItems, topInstances.length, i),
          )}
        </div>
      </div>

      {/* text overlay */}
      <div className="pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-center px-6 text-center">
        {heading ? (
          <h2
            aria-label={heading}
            className="text-foreground max-w-[560px] text-[32px] leading-[1.05] font-medium tracking-[-0.02em] text-balance sm:text-5xl sm:tracking-[-0.035em]"
          >
            {words.map((w, i) => (
              <Fragment key={i}>
                {headingBreak === i ? <br /> : null}
                <motion.span
                  aria-hidden="true"
                  className="inline-block"
                  initial={
                    reduce
                      ? false
                      : {
                          opacity: 0,
                          y: "0.38em",
                          rotate: 2,
                          filter: "blur(12px)",
                        }
                  }
                  animate={
                    entered
                      ? { opacity: 1, y: 0, rotate: 0, filter: "blur(0px)" }
                      : reduce
                        ? { opacity: 1, y: 0, rotate: 0, filter: "blur(0px)" }
                        : {
                            opacity: 0,
                            y: "0.38em",
                            rotate: 2,
                            filter: "blur(12px)",
                          }
                  }
                  transition={{
                    duration: 1.15,
                    ease: [0.16, 1, 0.3, 1],
                    delay: reduce ? 0 : 0.1 + i * 0.065,
                  }}
                >
                  {w}
                </motion.span>
                {i < words.length - 1 ? " " : ""}
              </Fragment>
            ))}
          </h2>
        ) : null}
        {description ? (
          <motion.p
            className="text-muted-foreground mt-5 max-w-[400px] text-sm leading-relaxed text-balance sm:text-base"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={
              entered
                ? { opacity: 1, y: 0 }
                : reduce
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 12 }
            }
            transition={{ duration: 0.8, delay: reduce ? 0 : 0.4 }}
          >
            {description}
          </motion.p>
        ) : null}
      </div>
    </div>
  );
}
