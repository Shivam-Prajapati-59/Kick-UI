"use client";

import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { animate, motion, useInView } from "motion/react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { cn } from "@/lib/utils";

import { FeatureArt } from "./vault-art";
import type { VaultArtKind } from "./vault-art";

export type { VaultArtKind };

export interface VaultFeature {
  name: string;
  /** One-line summary under the title. */
  tagline: string;
  /** Used for the filter chips. */
  category: string;
  illustration: VaultArtKind;
  chain?: string;
  /** Year it shipped, shown as "Since <year>" in the open panel. */
  since?: string;
  metric?: { value: string; label: string };
  description?: string;
}

export interface VaultCarouselProps {
  /** Features to render as cards. */
  features: VaultFeature[];
  /** Eyebrow label above the title. */
  eyebrow?: string;
  /** Supports "\n" for a manual line break. */
  title?: string;
  /** Extra classes for the section root. */
  className?: string;
}

const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";
// Mirrors Tailwind's `max-[720px]:` which compiles to `@media (width < 720px)`
// (exclusive), so the JS breakpoint stays in sync with the CSS at exactly 720px.
const NARROW_QUERY = "(max-width: 719.98px)";

function useMediaQuery(query: string) {
  const subscribe = (onChange: () => void) => {
    const media = window.matchMedia(query);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  };
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

const useMotionAllowed = () => !useMediaQuery(REDUCE_QUERY);
const useIsNarrow = () => useMediaQuery(NARROW_QUERY);

const EASE = [0.2, 0.8, 0.2, 1] as const;
const OPEN_EASE = [0.65, 0, 0.2, 1] as const;
const CLOSE_EASE = [0.32, 0.72, 0, 1] as const;
const PANEL_W = 325;
const ART_W = 300;

const SURFACE = "bg-[#f4f6f9] dark:bg-neutral-950";
const INK = "text-[#111111] dark:text-neutral-100";
const MUTED = "text-[#77768a] dark:text-neutral-400";
const HAIRLINE = "border-[rgba(17,17,17,0.14)] dark:border-white/15";
// The dark base colour matters: under a gradient image the light colour would
// bleed through the antialiased rounded corners as a pale fringe. The explicit
// color:/image: hints keep tailwind-merge from treating them as one utility.
const PANEL_BG =
  "bg-[#ebe8e1] dark:bg-[color:#1d222c] dark:bg-[image:linear-gradient(to_bottom,#1f2430,#1b1f2a)]";
const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1490f7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f6f9] dark:focus-visible:ring-offset-neutral-950";

const pad2 = (n: number) => String(n).padStart(2, "0");

// Where to scroll when a card opens. The track uses mandatory scroll snapping, so the
// result must be a snap position (a card's left edge on the padding) or the end of the
// track; among those where the WHOLE expanded card fits, pick the one nearest to where
// the card would stay if nothing moved.
function revealTarget(o: {
  scrollLeft: number; // current track.scrollLeft
  cardLeft: number; // card.offsetLeft in the current layout
  shift: number; // PANEL_W when a previously open card sits BEFORE this one (it collapses and pulls this card left), else 0
  cardWidth: number; // expanded width: art + PANEL_W on desktop, the art width on narrow screens
  viewport: number; // track.clientWidth
  pad: number; // scroll padding (40, or 16 on narrow screens)
  maxScroll: number; // largest scrollLeft in the FINAL layout
  snaps: number[]; // every card's snap position in the FINAL layout (offsetLeft - shift - pad)
}): number {
  const clamp = (v: number) =>
    Math.min(Math.max(v, 0), Math.max(o.maxScroll, 0));
  const finalLeft = o.cardLeft - o.shift;
  const ideal = o.scrollLeft - o.shift; // where the card would stay put
  const fits = (s: number) =>
    finalLeft - s >= o.pad - 0.5 &&
    finalLeft - s + o.cardWidth <= o.viewport - o.pad + 0.5;
  const valid = [...o.snaps.map(clamp), clamp(o.maxScroll)].filter(fits);
  if (!valid.length) return clamp(finalLeft - o.pad); // wider than the viewport: align left
  return valid.reduce((best, s) =>
    Math.abs(s - ideal) < Math.abs(best - ideal) ? s : best,
  );
}
function VaultCard({
  feature,
  index,
  total,
  open,
  shown,
  motionAllowed,
  isNarrow,
  register,
  onToggle,
}: {
  feature: VaultFeature;
  index: number;
  total: number;
  open: boolean;
  shown: boolean;
  motionAllowed: boolean;
  isNarrow: boolean;
  register: (i: number, el: HTMLDivElement | null) => void;
  onToggle: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const seen = useInView(cardRef, { once: true, amount: 0.4 });
  const onScreen = useInView(cardRef, { amount: 0.15 });

  useEffect(() => {
    register(index, cardRef.current);
    return () => register(index, null);
  }, [register, index]);

  const meta = [feature.chain, feature.since && `Since ${feature.since}`]
    .filter(Boolean)
    .join(" · ");

  // Panel text slides in from the side (below on small screens).
  const reveal = (delay: number, exitDelay: number = 0) => ({
    initial: false,
    animate: open
      ? { opacity: 1, x: 0, y: 0 }
      : {
          opacity: 0,
          transitionEnd: { x: isNarrow ? 0 : 14, y: isNarrow ? 10 : 0 },
        },
    transition: {
      opacity: {
        duration: motionAllowed ? (open ? 0.26 : 0.14) : 0,
        delay: motionAllowed ? (open ? delay : exitDelay) : 0,
        ease: open ? undefined : ("easeOut" as const),
      },
      x: {
        duration: motionAllowed ? (open ? 0.56 : 0) : 0,
        ease: EASE,
        delay: motionAllowed && open ? delay : 0,
      },
      y: {
        duration: motionAllowed ? (open ? 0.56 : 0) : 0,
        ease: EASE,
        delay: motionAllowed && open ? delay : 0,
      },
    },
  });

  return (
    // Outer layer owns the entrance fade so the hover-dim opacity below
    // never fights an inline motion style.
    <motion.div
      initial={false}
      animate={shown ? { opacity: 1 } : { opacity: 0 }}
      transition={
        motionAllowed
          ? { duration: 0.9, delay: 0.06 * index, ease: EASE }
          : { duration: 0 }
      }
      className="shrink-0"
    >
      <motion.div
        ref={cardRef}
        initial={false}
        animate={shown ? { y: 0 } : { y: 26 }}
        transition={
          motionAllowed
            ? { duration: 0.9, delay: 0.06 * index, ease: EASE }
            : { duration: 0 }
        }
        role="group"
        aria-roledescription="slide"
        aria-label={`${index + 1} of ${total}: ${feature.name}`}
        onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
        }}
        className={cn(
          "group/card snap-start transition-opacity duration-[420ms] motion-reduce:transition-none",
          "hover:opacity-100! [@media(hover:hover)]:group-hover/track:opacity-50",
          open && "opacity-100!",
        )}
      >
        {/* Art box: the illustration plus (when open) the detail panel. */}
        <div className="relative isolate">
          <div
            className={cn(
              "relative flex overflow-hidden rounded-2xl",
              "max-[720px]:flex-col",
            )}
          >
            <div className="relative aspect-[4/5] w-[300px] shrink-0 overflow-hidden bg-[#f1efe9] max-[720px]:w-[min(300px,78vw)] dark:bg-[#262b37]">
              <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(255,255,255,0.95),transparent_60%)] dark:bg-[radial-gradient(circle_at_50%_42%,rgba(96,140,210,0.34),transparent_62%)]"
              />
              <div className="absolute inset-0 p-4">
                <div className="size-full transition-transform duration-[900ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover/card:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover/card:scale-100">
                  <FeatureArt
                    kind={feature.illustration}
                    drawn={shown && seen}
                    live={hovered || focused || open}
                    onScreen={onScreen}
                    motionAllowed={motionAllowed}
                  />
                </div>
              </div>
              {/* The art itself carries the open/close semantics. */}
              <button
                type="button"
                onClick={onToggle}
                aria-expanded={open}
                aria-label={`Open details for ${feature.name}`}
                className={cn(
                  "absolute inset-0 z-0 cursor-pointer",
                  FOCUS_RING,
                )}
              />
              {/* Decorative twin of the toggle; hidden from AT and focus. */}
              <button
                type="button"
                aria-hidden
                tabIndex={-1}
                onClick={onToggle}
                className={cn(
                  "absolute top-3 right-3 z-10 grid size-8 place-items-center rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition-all duration-200 motion-reduce:transition-none",
                  SURFACE,
                  INK,
                  "hover:bg-[#111111] hover:text-[#f4f6f9] dark:hover:bg-neutral-100 dark:hover:text-neutral-950",
                  "scale-70 opacity-0 group-focus-within/card:scale-100 group-focus-within/card:opacity-100 group-hover/card:scale-100 group-hover/card:opacity-100",
                  "[@media(hover:none)]:scale-100 [@media(hover:none)]:opacity-100",
                  open && "scale-100 opacity-100",
                )}
              >
                <Plus
                  aria-hidden
                  className={cn(
                    "size-3.5 transition-transform duration-[520ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none",
                    open && "rotate-[135deg]",
                  )}
                />
              </button>
            </div>

            {/* Detail panel: widens beside the art, drops below it on small
              screens. Clipped while closed. */}
            <motion.div
              initial={false}
              animate={
                isNarrow
                  ? { width: "auto", height: open ? "auto" : 0 }
                  : { width: open ? PANEL_W : 0, height: "auto" }
              }
              transition={
                motionAllowed
                  ? open
                    ? { duration: 0.68, ease: OPEN_EASE }
                    : { duration: 0.5, ease: CLOSE_EASE, delay: 0.06 }
                  : { duration: 0 }
              }
              className="shrink-0 overflow-hidden"
              aria-hidden={!open}
            >
              <div
                className={cn(
                  "flex h-full flex-col justify-between gap-5 p-[22px]",
                  PANEL_BG,
                  "w-[325px] max-[720px]:w-[min(300px,78vw)]",
                )}
              >
                {meta && (
                  <motion.p
                    {...reveal(0, 0.05)}
                    className="text-xs tabular-nums"
                  >
                    {meta}
                  </motion.p>
                )}
                <div className="flex flex-col gap-4">
                  {feature.metric && (
                    <motion.div {...reveal(0.06, 0.025)}>
                      <p className="text-[34px] leading-none tracking-[-0.03em] tabular-nums">
                        {feature.metric.value}
                      </p>
                      <p className={cn("mt-1.5 text-xs", MUTED)}>
                        {feature.metric.label}
                      </p>
                    </motion.div>
                  )}
                  {feature.description && (
                    <motion.p
                      {...reveal(0.12, 0)}
                      className="text-[15px] leading-normal"
                    >
                      {feature.description}
                    </motion.p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
          {/* Soft layered shadow, opacity-driven to avoid animating box-shadow. */}
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0 -z-10 rounded-2xl shadow-[0_1px_2px_rgba(20,30,50,0.04),0_8px_16px_-4px_rgba(20,30,50,0.06),0_24px_40px_-12px_rgba(20,30,50,0.12),0_48px_72px_-24px_rgba(20,30,50,0.14)] transition-opacity duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none dark:shadow-[0_2px_4px_rgba(0,0,0,0.35),0_12px_24px_-6px_rgba(0,0,0,0.5),0_32px_56px_-16px_rgba(0,0,0,0.65)]",
              open
                ? "opacity-100"
                : hovered || focused
                  ? "opacity-60"
                  : "opacity-35",
            )}
          />
          {/* Blue ambient glow, only when open (dark mode). */}
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0 -z-10 rounded-2xl shadow-[0_16px_48px_-12px_rgba(47,127,247,0.22)] transition-opacity duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none dark:shadow-[0_16px_48px_-12px_rgba(47,127,247,0.22)]",
              open ? "opacity-100" : "opacity-0",
            )}
          />
        </div>

        <div className="mt-4 w-[300px] max-[720px]:w-[min(300px,78vw)]">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="truncate text-lg tracking-[-0.02em]">
              {feature.name}
            </h3>
            <span
              className={cn(
                "text-xs tabular-nums transition-colors motion-reduce:transition-none",
                open ? INK : MUTED,
              )}
            >
              {pad2(index + 1)}
            </span>
          </div>
          <p className={cn("mt-[3px] truncate text-sm", MUTED)}>
            {feature.tagline}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function VaultCarousel({
  features,
  eyebrow,
  title,
  className,
}: VaultCarouselProps) {
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const drag = useRef({ down: false, moved: false, x: 0, left: 0 });
  const prevOpenRef = useRef<number | null>(null);
  const scrollAnimRef = useRef<{ stop: () => void } | null>(null);
  // Card the user asked to go to; kept selected when the track clamps short of it.
  const requestedRef = useRef<number | null>(null);

  const motionAllowed = useMotionAllowed();
  const isNarrow = useIsNarrow();
  const inView = useInView(rootRef, { once: true });
  // Reduced-motion users skip the entrance entirely.
  const shown = inView || !motionAllowed;

  const [filter, setFilter] = useState("all");
  const [active, setActive] = useState(0);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);

  const filters = [
    { key: "all", label: "All layers", count: features.length },
    ...[...new Set(features.map((f) => f.category))].map((category) => ({
      key: category,
      label: category,
      count: features.filter((f) => f.category === category).length,
    })),
  ];
  const visible =
    filter === "all" ? features : features.filter((f) => f.category === filter);
  const total = visible.length;

  const register = useCallback((i: number, el: HTMLDivElement | null) => {
    cardRefs.current[i] = el;
  }, []);

  type ScrollEase = typeof EASE | typeof OPEN_EASE;

  const animateTrackScroll = useCallback(
    (
      track: HTMLDivElement,
      target: number,
      duration: number,
      ease: ScrollEase,
    ) => {
      const startLeft = track.scrollLeft;
      track.style.scrollSnapType = "none";
      const dur = motionAllowed ? duration : 0;
      const controls = animate(startLeft, target, {
        duration: dur,
        ease,
        onUpdate: (v) => {
          track.scrollLeft = v;
        },
        onComplete: () => {
          track.style.scrollSnapType = "";
          scrollAnimRef.current = null;
        },
        onStop: () => {
          track.style.scrollSnapType = "";
          scrollAnimRef.current = null;
        },
      });
      scrollAnimRef.current = controls;
    },
    [motionAllowed],
  );

  const scrollToCard = useCallback(
    (i: number, duration = 0.5) => {
      const track = trackRef.current;
      const card = cardRefs.current[i];
      if (!track || !card) return;
      scrollAnimRef.current?.stop();
      requestedRef.current = i;
      setActive(i);
      const pad = parseFloat(getComputedStyle(track).scrollPaddingLeft) || 0;
      const leftBase = Math.max(card.offsetLeft - pad, 0);
      const maxScroll = track.scrollWidth - track.clientWidth;
      const target = Math.min(Math.max(leftBase, 0), Math.max(maxScroll, 0));
      const ease: ScrollEase = duration >= 0.68 ? OPEN_EASE : EASE;
      animateTrackScroll(track, target, duration, ease);
    },
    [animateTrackScroll],
  );

  const revealCard = useCallback(
    (i: number) => {
      const track = trackRef.current;
      const card = cardRefs.current[i];
      if (!track || !card) return;
      scrollAnimRef.current?.stop();
      requestedRef.current = null;
      const pad = parseFloat(getComputedStyle(track).scrollPaddingLeft) || 0;
      const prevOpen = prevOpenRef.current;
      let shift: number;
      let cardWidth: number;
      let maxScroll: number;
      if (isNarrow) {
        shift = 0;
        cardWidth = card.offsetWidth;
        maxScroll = track.scrollWidth - track.clientWidth;
      } else {
        shift = prevOpen !== null && prevOpen < i ? PANEL_W : 0;
        cardWidth = ART_W + PANEL_W;
        maxScroll =
          track.scrollWidth +
          PANEL_W -
          (prevOpen !== null ? PANEL_W : 0) -
          track.clientWidth;
      }
      const viewport = track.clientWidth;
      const scrollLeft = track.scrollLeft;
      const cardLeft = card.offsetLeft;
      const snaps = cardRefs.current
        .map((el, k) =>
          el
            ? el.offsetLeft -
              (!isNarrow && prevOpen !== null && prevOpen < k ? PANEL_W : 0) -
              pad
            : NaN,
        )
        .filter(Number.isFinite);
      const target = revealTarget({
        scrollLeft,
        cardLeft,
        shift,
        cardWidth,
        viewport,
        pad,
        maxScroll,
        snaps,
      });
      if (target === scrollLeft) return;
      animateTrackScroll(track, target, 0.68, OPEN_EASE);
    },
    [isNarrow, animateTrackScroll],
  );

  // The active card is the one whose left edge is nearest the scroll start.
  const nearestIndex = () => {
    const track = trackRef.current;
    if (!track) return 0;
    let best = 0;
    let dist = Infinity;
    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      const d = Math.abs(card.offsetLeft - track.scrollLeft);
      if (d < dist) {
        dist = d;
        best = i;
      }
    });
    return best;
  };

  const stopScroll = () => {
    scrollAnimRef.current?.stop();
    requestedRef.current = null;
  };

  // Selection follows the scroll position, except that a requested card the
  // track cannot reach (several cards fit at max scroll) stays selected.
  const syncActive = () => {
    const track = trackRef.current;
    const nearest = nearestIndex();
    const requested = requestedRef.current;
    if (track && requested !== null) {
      if (scrollAnimRef.current) return;
      const card = cardRefs.current[requested];
      const max = track.scrollWidth - track.clientWidth;
      const pad = parseFloat(getComputedStyle(track).scrollPaddingLeft) || 0;
      if (
        card &&
        track.scrollLeft >= max - 1 &&
        card.offsetLeft - pad >= max - 1 &&
        nearest <= requested
      ) {
        setActive(requested);
        return;
      }
      requestedRef.current = null;
    }
    setActive(nearest);
  };

  // Filter changes reset the track: back to the start, nothing open.
  const changeFilter = (key: string) => {
    scrollAnimRef.current?.stop();
    setFilter(key);
    setOpenIndex(null);
    setActive(0);
    requestedRef.current = null;
    prevOpenRef.current = null;
    trackRef.current?.scrollTo({ left: 0 });
  };

  // Keep a freshly opened card fully on screen.
  useEffect(() => {
    if (openIndex === null) {
      prevOpenRef.current = null;
      return;
    }
    revealCard(openIndex);
    prevOpenRef.current = openIndex;
  }, [openIndex, revealCard]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    stopScroll();
    drag.current = {
      down: true,
      moved: false,
      x: e.clientX,
      left: e.currentTarget.scrollLeft,
    };
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current.down) return;
    // Button released outside the track: finish the drag instead of sticking.
    if (e.buttons === 0) {
      endDrag();
      return;
    }
    const dx = e.clientX - drag.current.x;
    if (!drag.current.moved && Math.abs(dx) > 5) {
      drag.current.moved = true;
      setDragging(true);
      // Capturing on pointerdown would retarget the click to the track.
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    if (!drag.current.moved) return;
    e.currentTarget.scrollLeft = drag.current.left - dx;
  };

  const endDrag = () => {
    if (!drag.current.down) return;
    drag.current.down = false;
    setDragging(false);
    if (drag.current.moved) scrollToCard(nearestIndex());
  };

  // A drag that ends over a card must not toggle it.
  const suppressClickAfterDrag = (e: ReactMouseEvent) => {
    if (!drag.current.moved) return;
    drag.current.moved = false;
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    return () => {
      scrollAnimRef.current?.stop();
    };
  }, []);

  const onTrackKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    // Step from the focused card; fall back to the selection when the track
    // itself has focus.
    const focusedAt = cardRefs.current.findIndex((c) =>
      c?.contains(e.target as Node),
    );
    const from = focusedAt >= 0 ? focusedAt : active;
    const next = Math.min(
      Math.max(from + (e.key === "ArrowRight" ? 1 : -1), 0),
      total - 1,
    );
    scrollToCard(next);
    // Focus follows the selection so Enter/Space act on that card.
    cardRefs.current[next]
      ?.querySelector<HTMLButtonElement>("button[aria-expanded]")
      ?.focus({ preventScroll: true });
  };

  return (
    <section
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={title}
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpenIndex(null);
      }}
      className={cn("overflow-hidden py-[20px]", SURFACE, INK, className)}
    >
      <motion.div
        initial={false}
        animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        transition={
          motionAllowed ? { duration: 0.8, ease: EASE } : { duration: 0 }
        }
        className="mb-9 flex items-end justify-between gap-8 px-10 max-[720px]:flex-col max-[720px]:items-stretch max-[720px]:px-4"
      >
        <div className="min-w-0">
          {eyebrow && (
            <p
              className={cn(
                "mb-3.5 flex items-center gap-2 text-[13px]",
                MUTED,
              )}
            >
              <span
                aria-hidden
                className="size-1.5 rounded-full bg-[#1490f7]"
              />
              {eyebrow}
            </p>
          )}
          {title && (
            <h2 className="text-[44px] leading-[1.04] font-normal tracking-[-0.04em] whitespace-pre-line max-[720px]:text-[32px]">
              {title}
            </h2>
          )}
          <div className="mt-[18px] flex flex-wrap gap-1.5">
            {filters.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => changeFilter(f.key)}
                aria-pressed={filter === f.key}
                className={cn(
                  "flex h-[30px] cursor-pointer items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors motion-reduce:transition-none",
                  FOCUS_RING,
                  filter === f.key
                    ? "border-transparent bg-[#111111] text-[#f4f6f9] dark:bg-neutral-100 dark:text-neutral-950"
                    : cn(
                        HAIRLINE,
                        "hover:border-[#111111] dark:hover:border-neutral-100",
                      ),
                )}
              >
                {f.label}
                <span className="text-[10px] tabular-nums opacity-55">
                  {f.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <p aria-live="polite" className="min-w-16 text-sm tabular-nums">
            <span className={INK}>{pad2(Math.min(active + 1, total))}</span>
            <span className={MUTED}> / {pad2(total)}</span>
          </p>
          <button
            type="button"
            onClick={() => scrollToCard(active - 1)}
            disabled={active <= 0}
            aria-label="Previous feature"
            className={cn(
              "group/nav grid size-12 cursor-pointer place-items-center rounded-full border transition-colors disabled:pointer-events-none disabled:opacity-35 motion-reduce:transition-none",
              HAIRLINE,
              FOCUS_RING,
              "hover:bg-[#111111] hover:text-[#f4f6f9] dark:hover:bg-neutral-100 dark:hover:text-neutral-950",
            )}
          >
            <ArrowLeft
              aria-hidden
              className="size-[18px] transition-transform duration-200 group-hover/nav:-translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover/nav:translate-x-0"
            />
          </button>
          <button
            type="button"
            onClick={() => scrollToCard(active + 1)}
            disabled={active >= total - 1}
            aria-label="Next feature"
            className={cn(
              "group/nav grid size-12 cursor-pointer place-items-center rounded-full border transition-colors disabled:pointer-events-none disabled:opacity-35 motion-reduce:transition-none",
              HAIRLINE,
              FOCUS_RING,
              "hover:bg-[#111111] hover:text-[#f4f6f9] dark:hover:bg-neutral-100 dark:hover:text-neutral-950",
            )}
          >
            <ArrowRight
              aria-hidden
              className="size-[18px] transition-transform duration-200 group-hover/nav:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover/nav:translate-x-0"
            />
          </button>
        </div>
      </motion.div>

      {/* Scroll track. Mouse drags scroll it; snap is off while dragging. */}
      <div
        ref={trackRef}
        style={{ scrollBehavior: "auto" }}
        onScroll={syncActive}
        onKeyDown={(e) => {
          stopScroll();
          onTrackKeyDown(e);
        }}
        onWheel={stopScroll}
        onTouchStart={stopScroll}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={suppressClickAfterDrag}
        tabIndex={0}
        role="group"
        aria-label="Security features"
        className={cn(
          "group/track relative -my-10 scroll-pl-10 overflow-x-auto overscroll-x-contain py-10 max-[720px]:scroll-pl-4",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          FOCUS_RING,
          dragging
            ? "cursor-grabbing snap-none select-none"
            : "cursor-grab snap-x snap-mandatory",
        )}
      >
        <motion.div
          key={filter}
          initial={motionAllowed ? { opacity: 0, y: 12 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={
            motionAllowed ? { duration: 0.4, ease: EASE } : { duration: 0 }
          }
          className="flex w-max gap-4 px-10 max-[720px]:px-4"
        >
          {visible.map((feature, i) => (
            <VaultCard
              key={feature.name}
              feature={feature}
              index={i}
              total={total}
              open={openIndex === i}
              shown={shown}
              motionAllowed={motionAllowed}
              isNarrow={isNarrow}
              register={register}
              onToggle={() =>
                setOpenIndex((current) => (current === i ? null : i))
              }
            />
          ))}
        </motion.div>
      </div>

      {/* Ticks: one per feature, click to scroll it into view. */}
      <motion.div
        initial={false}
        animate={shown ? { opacity: 1 } : { opacity: 0 }}
        transition={
          motionAllowed
            ? { duration: 0.5, delay: shown ? 0.42 : 0 }
            : { duration: 0 }
        }
        className="px-10 max-[720px]:px-4"
      >
        <div role="tablist" aria-label="Choose a feature" className="mt-9 flex">
          {visible.map((feature, i) => (
            <button
              key={feature.name}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={feature.name}
              onClick={() => scrollToCard(i)}
              className="group/tick relative flex h-6 cursor-pointer items-center px-0.5"
            >
              <span
                className={cn(
                  "h-[2px] w-[14px] rounded-full transition-[width,background-color] duration-[560ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none",
                  i === active
                    ? "w-9 bg-[#111111] dark:bg-neutral-100"
                    : cn(
                        "bg-[rgba(17,17,17,0.14)] dark:bg-white/15",
                        "group-hover/tick:bg-[#77768a] dark:group-hover/tick:bg-neutral-400",
                      ),
                )}
              />
              <span
                aria-hidden
                className={cn(
                  "pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 translate-y-1 pb-1 text-[11px] whitespace-nowrap opacity-0 transition-[opacity,translate] duration-200 group-hover/tick:translate-y-0 group-hover/tick:opacity-100",
                  MUTED,
                )}
              >
                {feature.name}
              </span>
            </button>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

export default VaultCarousel;
export { VaultCarousel };
