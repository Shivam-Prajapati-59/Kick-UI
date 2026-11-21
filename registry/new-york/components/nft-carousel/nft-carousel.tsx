"use client";

import {
  type ElementType,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { animate, useMotionValue } from "motion/react";
import { cn } from "@/lib/utils";

export type NftCarouselItem = {
  image: string;
  name: string;
  ticker?: string;
  creator?: string;
  description?: string;
  stat?: string;
  marketCap?: string;
  /** Bonding-curve progress, 0–100. The bar is hidden when omitted. */
  progress?: number;
  /** CSS colour or gradient behind the image. Defaults to the `muted` token. */
  background?: string;
  href?: string;
  pixelated?: boolean;
};

export type NftCarouselProps = {
  items: NftCarouselItem[];
  initialIndex?: number;
  interval?: number;
  autoplay?: boolean;
  cardWidth?: number;
  "aria-label"?: string;
  className?: string;
};

const EASE = "cubic-bezier(0.22,1,0.36,1)";
// One card unit per 0.962 * cardW of pointer travel: the 1-unit slot's offset.
const SLOT_GAP = 0.962;
const PARK = 2.4;
// Slot geometry at |distance| 0, 1, 2 and parked, in card units.
const SLOT_AT = [0, 1, 2, PARK];
const SLOT_X = [0, SLOT_GAP, 1.793, PARK];
const SLOT_SCALE = [1, 0.82, 0.738, 0.7];
const SLOT_OPACITY = [1, 1, 0.62, 0];

const mod = (n: number, m: number) => ((n % m) + m) % m;
const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

// Signed card distance from the continuous position, wrapped to (-count/2, count/2].
function offsetOf(index: number, position: number, count: number) {
  const raw = (index - position) % count;
  if (raw > count / 2) return raw - count;
  if (raw < -count / 2) return raw + count;
  return raw;
}

// Piecewise-linear slot at a fractional distance, so x, scale and opacity move
// on the same path whether a finger or a spring is driving the position.
function slotAt(distance: number) {
  const a = Math.min(Math.abs(distance), PARK);
  let i = 0;
  while (i < SLOT_AT.length - 2 && a > SLOT_AT[i + 1]) i += 1;
  const t = (a - SLOT_AT[i]) / (SLOT_AT[i + 1] - SLOT_AT[i]);
  return {
    x: lerp(SLOT_X[i], SLOT_X[i + 1], t),
    scale: lerp(SLOT_SCALE[i], SLOT_SCALE[i + 1], t),
    opacity: lerp(SLOT_OPACITY[i], SLOT_OPACITY[i + 1], t),
  };
}

// Apple's deceleration projection: where a flick would come to rest.
// The snappier 0.99 rate suits a card step, where 0.998 overshoots by cards.
const project = (velocity: number) => (velocity / 1000) * (0.99 / (1 - 0.99));

export default function NftCarousel({
  items,
  initialIndex = 0,
  interval = 4000,
  autoplay = true,
  cardWidth = 422,
  "aria-label": ariaLabel = "NFT drops",
  className,
}: NftCarouselProps) {
  const count = items.length;
  const requestedIndex = Number.isFinite(initialIndex)
    ? Math.trunc(initialIndex)
    : 0;
  const start =
    count > 0 ? Math.min(Math.max(requestedIndex, 0), count - 1) : 0;
  // A zero, negative or NaN interval would throw in animate() and the dot fill.
  const safeInterval =
    Number.isFinite(interval) && interval > 0 ? interval : 4000;
  const [active, setActive] = useState(start);
  // The card we are travelling to; drives copy and dots on the key press
  // instead of waiting for the spring to pass the halfway point.
  const [heading, setHeading] = useState<number | null>(start);
  const [reduced, setReduced] = useState(false);
  const [width, setWidth] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [pressed, setPressed] = useState<number | null>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const [inView, setInView] = useState(true);
  const [introReady, setIntroReady] = useState(false);

  // One unbounded value in card units drives every card; React never renders
  // per frame, the write loop below does that imperatively.
  const position = useMotionValue(start);
  const intro = useMotionValue(0);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const fillRef = useRef<HTMLSpanElement | null>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const drawRef = useRef<() => void>(() => {});
  // A card node was replaced (href swaps the element type); draw once before paint.
  const pendingDrawRef = useRef(false);
  const activeRef = useRef(start);
  const prevCountRef = useRef(count);
  // Destination of the current slide; null while a drag owns the position.
  const targetRef = useRef<number | null>(start);
  const headingRef = useRef<number | null>(start);
  const introReadyRef = useRef(false);
  const reducedRef = useRef(reduced);
  const enteredRef = useRef(false);
  const slideRef = useRef<ReturnType<typeof animate> | null>(null);
  const introAnimationRef = useRef<ReturnType<typeof animate> | null>(null);
  const dragRef = useRef({
    active: false,
    pointerId: -1,
    startX: 0,
    startPos: 0,
    moved: 0,
  });
  const samplesRef = useRef<{ x: number; t: number }[]>([]);

  // The ±1 neighbour's outer edge is 0.962*cardW + 0.82*cardW/2 = 1.372*cardW;
  // cap the card so both neighbours stay fully inside the root.
  const phone = width * 0.72;
  const wide = Math.min(width * 0.42, (width / 2 - 12) / 1.372);
  const cardW = Math.min(
    cardWidth,
    // Blended so the phone ratio does not jump when the wide rule takes over.
    lerp(phone, wide, clamp01((width - 480) / (640 - 480))),
  );
  const cardH = cardW * 1.351;
  const radius = cardW * 0.08;
  // Phones need smaller copy so the text block stays on the fade.
  const compact = width < 640;
  const canRotate = autoplay && count > 1;
  const paused =
    !canRotate ||
    reduced ||
    dragging ||
    tabHidden ||
    !inView ||
    !introReady ||
    hovered ||
    focused;

  const current = count > 0 ? mod(heading ?? active, count) : 0;

  const syncHeading = useCallback(
    (target: number | null) => {
      const next = target === null || count === 0 ? null : mod(target, count);
      if (next === headingRef.current) return;
      headingRef.current = next;
      setHeading(next);
    },
    [count],
  );

  const draw = useCallback(() => {
    const live = position.get();
    const spread = clamp01(intro.get());
    if (count === 0) return;
    for (let i = 0; i < count; i += 1) {
      const el = cardRefs.current[i];
      if (!el) continue;
      const distance = offsetOf(i, live, count);
      const slot = slotAt(distance);
      // A card is invisible at the wrap seam, where it teleports to the far
      // side. With two cards the seam sits on the resting neighbour, so fade a
      // card only once it has crossed the seam and leave both visible at rest.
      let seam =
        count > 2 ? clamp01((count / 2 - Math.abs(distance)) / 0.5) : 1;
      if (count === 2 && (i - live) * distance < 0) {
        seam = clamp01((1 - Math.abs(distance)) / 0.35);
      }
      const x = (distance < 0 ? -slot.x : slot.x) * cardW * spread;
      const scale = lerp(0.9, slot.scale, spread);
      const opacity = slot.opacity * seam * clamp01(spread * 1.4);
      el.style.transform = `translate3d(${x}px, 0, 0) scale(${scale})`;
      el.style.opacity = `${opacity}`;
      el.style.zIndex = `${Math.round(100 - Math.abs(distance) * 10)}`;
      el.style.pointerEvents = opacity < 0.01 ? "none" : "auto";
      const img = imgRefs.current[i];
      if (img) {
        img.style.transform = reducedRef.current
          ? "scale(1)"
          : `scale(${1 + 0.06 * Math.min(Math.abs(distance), 1)})`;
      }
    }
  }, [cardW, count, position, intro]);

  useLayoutEffect(() => {
    drawRef.current = draw;
    draw();
  }, [draw]);

  // Node swaps are batched into one draw; inline ref callbacks run every commit.
  useLayoutEffect(() => {
    if (!pendingDrawRef.current) return;
    pendingDrawRef.current = false;
    drawRef.current();
  });

  // A changed list length rebases the live position, not just the copy.
  useLayoutEffect(() => {
    const previous = prevCountRef.current;
    prevCountRef.current = count;
    // Index keys only trim the tail, so drop refs for cards the list removed.
    if (cardRefs.current.length > count) cardRefs.current.length = count;
    if (imgRefs.current.length > count) imgRefs.current.length = count;
    if (count === 0) return;
    if (previous === count) {
      if (headingRef.current === null) return;
      syncHeading(targetRef.current ?? Math.round(position.get()));
      drawRef.current();
      return;
    }
    // Keep the same card selected: resolve it under the old count, stop the
    // spring, then rebase position and destination under the new one. An
    // in-flight destination wins over the live position, which is still short
    // of the card it is travelling to.
    const live = position.get();
    const base = targetRef.current ?? Math.round(live);
    // An empty list has no card to resolve, so an empty-to-filled change
    // honours `initialIndex` instead of restarting at the first card.
    const selected = previous > 0 ? mod(base, previous) : start;
    slideRef.current?.stop();
    slideRef.current = null;
    const next = Math.min(selected, count - 1);
    // A live drag reads startPos as its origin; move it by the same rebase so
    // the finger does not jump.
    if (dragRef.current.active) dragRef.current.startPos += next - live;
    position.set(next);
    targetRef.current = next;
    syncHeading(next);
    drawRef.current();
  }, [count, position, start, syncHeading]);

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    setWidth(el.getBoundingClientRect().width);
    const observer = new ResizeObserver((entries) => {
      const next = entries[0]?.contentRect.width;
      if (next) setWidth(next);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    reducedRef.current = reduced;
    if (reduced) {
      introAnimationRef.current?.stop();
      slideRef.current?.stop();
      slideRef.current = null;
      intro.set(1);
      // A live drag snaps on its own release; the destination is where a
      // pending slide was already headed.
      if (!dragRef.current.active) {
        const target = targetRef.current ?? Math.round(position.get());
        position.set(target);
        targetRef.current = target;
        syncHeading(target);
      }
    }
    drawRef.current();
  }, [reduced, intro, position, syncHeading]);

  useEffect(() => {
    const update = () => setTabHidden(document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  useEffect(() => {
    if (count === 0) return;
    const sync = () => {
      const rounded = mod(Math.round(position.get()), count);
      if (rounded !== activeRef.current) {
        activeRef.current = rounded;
        setActive(rounded);
      }
      if (!introReadyRef.current && intro.get() >= 0.6) {
        introReadyRef.current = true;
        setIntroReady(true);
      }
      drawRef.current();
    };
    const stopPosition = position.on("change", sync);
    const stopIntro = intro.on("change", sync);
    sync();
    return () => {
      stopPosition();
      stopIntro();
    };
  }, [count, position, intro]);

  // The fan-out runs once, when the stage first becomes visible.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === "undefined") {
      intro.set(1);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        setInView(entry.isIntersecting);
        // Any visible sliver is enough: waiting for a ratio kept the cards
        // hidden in short viewports that never show 30% of the root.
        if (enteredRef.current || !entry.isIntersecting) {
          return;
        }
        enteredRef.current = true;
        if (reducedRef.current) {
          intro.set(1);
          introReadyRef.current = true;
          setIntroReady(true);
          return;
        }
        introAnimationRef.current = animate(intro, 1, {
          type: "spring",
          bounce: 0,
          duration: 0.8,
        });
      },
      { threshold: 0 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, [intro]);

  const settle = (target: number) => {
    slideRef.current?.stop();
    targetRef.current = target;
    syncHeading(target);
    if (reducedRef.current) {
      position.set(target);
      return;
    }
    slideRef.current = animate(position, target, {
      type: "spring",
      bounce: 0,
      duration: 0.45,
    });
  };

  const stepBy = useCallback(
    (delta: number) => {
      // The finger owns the position until it lifts.
      if (dragRef.current.active) return;
      slideRef.current?.stop();
      // Step from the slide's destination, so presses that arrive before the
      // spring passes halfway still each advance a card.
      const target = (targetRef.current ?? Math.round(position.get())) + delta;
      targetRef.current = target;
      syncHeading(target);
      if (reducedRef.current) {
        position.set(target);
        return;
      }
      slideRef.current = animate(position, target, {
        type: "spring",
        bounce: 0,
        duration: 0.5,
      });
    },
    [position, syncHeading],
  );

  const goTo = useCallback(
    (target: number) => {
      // The finger owns the position until it lifts.
      if (dragRef.current.active || count === 0) return;
      const base = targetRef.current ?? Math.round(position.get());
      const raw = mod(target, count) - mod(base, count);
      const delta =
        raw > count / 2 ? raw - count : raw < -count / 2 ? raw + count : raw;
      if (delta === 0) return;
      slideRef.current?.stop();
      const dest = base + delta;
      targetRef.current = dest;
      syncHeading(dest);
      if (reducedRef.current) {
        position.set(dest);
        return;
      }
      slideRef.current = animate(position, dest, {
        type: "spring",
        bounce: 0,
        duration: 0.5,
      });
    },
    [count, position, syncHeading],
  );

  useEffect(() => {
    if (paused || count < 2) return;
    const id = window.setTimeout(() => {
      // Never hide a card that still holds keyboard focus.
      const root = rootRef.current;
      const focused = document.activeElement;
      if (root && focused instanceof Node) {
        const card = root.querySelector(
          `[data-nft-card="${activeRef.current}"]`,
        );
        if (card?.contains(focused)) root.focus();
      }
      stepBy(1);
    }, safeInterval);
    return () => window.clearTimeout(id);
  }, [count, current, safeInterval, paused, stepBy]);

  // Restart the dot's fill on every slide; hold it full while paused.
  useEffect(() => {
    const el = fillRef.current;
    if (!el) return;
    if (paused) {
      el.style.transform = "scaleX(1)";
      return;
    }
    el.style.transform = "scaleX(0)";
    const animation = el.animate(
      [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }],
      { duration: safeInterval, easing: "linear", fill: "forwards" },
    );
    return () => animation.cancel();
  }, [current, paused, safeInterval, count]);

  useEffect(
    () => () => {
      slideRef.current?.stop();
      introAnimationRef.current?.stop();
    },
    [],
  );

  const endDrag = () => {
    dragRef.current.active = false;
    dragRef.current.pointerId = -1;
    samplesRef.current = [];
    // Release hands the position back to the springs at the nearest card; a
    // flick or settle then retargets from there.
    const rounded = Math.round(position.get());
    targetRef.current = rounded;
    syncHeading(rounded);
    setDragging(false);
    setPressed(null);
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    // One gesture at a time: a second finger must not retarget the drag.
    if (dragRef.current.active && dragRef.current.pointerId !== e.pointerId) {
      return;
    }
    // Only a primary mouse press starts a slide; other buttons stay native.
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const card =
      e.target instanceof Element ? e.target.closest("[data-nft-card]") : null;
    setPressed(card ? Number(card.getAttribute("data-nft-card")) : null);
    if (count < 2) return;
    slideRef.current?.stop();
    slideRef.current = null;
    // The drag owns the position now; there is no destination until release.
    targetRef.current = null;
    dragRef.current = {
      active: true,
      pointerId: e.pointerId,
      startX: e.clientX,
      startPos: position.get(),
      moved: 0,
    };
    samplesRef.current = [{ x: e.clientX, t: performance.now() }];
    setDragging(true);
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag.active || drag.pointerId !== e.pointerId) return;
    if (e.buttons === 0) {
      // Released outside the stage before the drag captured the pointer.
      endDrag();
      settle(Math.round(position.get()));
      return;
    }
    const dx = e.clientX - drag.startX;
    drag.moved = Math.max(drag.moved, Math.abs(dx));
    if (drag.moved <= 6) return;
    // Capture only once it is a drag, so a plain tap still clicks the card.
    setPressed(null);
    // No destination while the finger owns it; copy follows the live card.
    syncHeading(null);
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {}
    }
    const spacing = SLOT_GAP * cardW;
    if (spacing > 0) position.set(drag.startPos - dx / spacing);
    const t = performance.now();
    const samples = samplesRef.current;
    samples.push({ x: e.clientX, t });
    while (samples.length > 0 && t - samples[0].t > 100) samples.shift();
  };

  const handlePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (drag.active && drag.pointerId !== e.pointerId) return;
    setPressed(null);
    if (!drag.active || drag.pointerId !== e.pointerId) return;
    const now = performance.now();
    const samples = samplesRef.current;
    const newest = samples[samples.length - 1];
    const oldest = samples[0];
    let vx = 0;
    if (newest && oldest && newest.t > oldest.t && now - newest.t <= 80) {
      vx = ((newest.x - oldest.x) / (newest.t - oldest.t)) * 1000;
    }
    const dragged = drag.moved > 6;
    endDrag();
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    if (!dragged) {
      // A tap may have interrupted a slide; let it settle instead of stalling.
      const live = position.get();
      if (Math.abs(live - Math.round(live)) > 0.001) settle(Math.round(live));
      return;
    }
    const spacing = SLOT_GAP * cardW;
    if (spacing <= 0) return;
    if (reducedRef.current) {
      settle(Math.round(position.get()));
      return;
    }
    const velocity = -vx / spacing;
    const projected = position.get() + project(velocity);
    const releaseBase = Math.round(position.get());
    // One flick is at most a two-card throw, however fast the pointer moved; a
    // slow drag lands on the nearest card instead of being pulled back.
    const target =
      Math.abs(vx) > 400
        ? Math.min(
            releaseBase + 2,
            Math.max(releaseBase - 2, Math.round(projected)),
          )
        : releaseBase;
    targetRef.current = target;
    syncHeading(target);
    slideRef.current?.stop();
    slideRef.current = animate(position, target, {
      type: "spring",
      velocity,
      // Bounce only when the gesture itself carried momentum.
      bounce: Math.abs(vx) > 400 ? 0.15 : 0,
      duration: 0.45,
    });
  };

  const handlePointerCancel = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (drag.active && drag.pointerId !== e.pointerId) return;
    setPressed(null);
    if (!drag.active || drag.pointerId !== e.pointerId) return;
    endDrag();
    settle(Math.round(position.get()));
  };

  const handlePointerLeave = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (drag.active && drag.pointerId !== e.pointerId) return;
    setPressed(null);
    // Nothing is captured before the 6px threshold, so leaving the stage ends
    // the drag; a captured swipe keeps tracking outside it.
    if (
      drag.active &&
      drag.pointerId === e.pointerId &&
      !e.currentTarget.hasPointerCapture(e.pointerId)
    ) {
      endDrag();
      settle(Math.round(position.get()));
    }
  };

  const handleClickCapture = (e: MouseEvent<HTMLDivElement>) => {
    // detail 0 is keyboard activation and must never be swallowed by an old drag.
    if (e.detail > 0 && dragRef.current.moved > 6) {
      e.preventDefault();
      e.stopPropagation();
    }
    dragRef.current.moved = 0;
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (count < 2) return;
    // Arrows pressed on the active card's link would otherwise slide a focused
    // element into an aria-hidden card, so hand focus to the region first.
    const fromCard =
      e.target instanceof Element &&
      e.target.closest("[data-nft-card]") !== null;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (fromCard) rootRef.current?.focus();
      stepBy(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      if (fromCard) rootRef.current?.focus();
      stepBy(1);
    }
  };

  // Content enters staggered and leaves faster along the reverse path.
  const reveal = (
    shown: boolean,
    enter: number,
    delay: number,
    exitY: number,
  ) => {
    const duration = reduced ? 200 : shown ? enter : 160;
    const wait = reduced || !shown ? 0 : delay;
    return {
      opacity: shown ? 1 : 0,
      transform: reduced ? undefined : `translateY(${shown ? 0 : exitY}px)`,
      transition: reduced
        ? `opacity ${duration}ms ${EASE}`
        : `opacity ${duration}ms ${EASE} ${wait}ms, transform ${duration}ms ${EASE} ${wait}ms`,
    };
  };

  const gradientStyle = (shown: boolean) => ({
    opacity: shown ? 1 : 0,
    transition: `opacity ${reduced ? 200 : shown ? 320 : 200}ms ${EASE} ${reduced || !shown ? 0 : 60}ms`,
  });

  const dotsStyle = {
    opacity: introReady ? 1 : 0,
    transform: reduced || introReady ? "none" : "translateY(8px)",
    transition: reduced
      ? `opacity 200ms ${EASE}`
      : `opacity 420ms ${EASE} 200ms, transform 420ms ${EASE} 200ms`,
  };

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
      // Only keyboard focus pauses; a mouse click on a dot must not stop autoplay for good.
      onFocus={(e) => setFocused(e.target.matches(":focus-visible"))}
      onBlur={() => setFocused(false)}
      className={cn(
        "focus-visible:ring-ring/40 relative w-full outline-none select-none focus-visible:ring-2",
        dragging ? "cursor-grabbing" : "cursor-grab",
        className,
      )}
      style={{ visibility: width > 0 ? "visible" : "hidden" }}
    >
      <div
        className="relative w-full"
        style={{
          // Extra block space keeps card shadows inside the edge-fade mask.
          height: cardH + 160,
          marginBlock: -80,
          overflowX: "clip",
          touchAction: "pan-y",
          maskImage:
            "linear-gradient(90deg, transparent, #000 4%, #000 96%, transparent)",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onLostPointerCapture={(e) => {
          // Capture is lost by the stage itself; card events bubble up here.
          if (e.target === e.currentTarget) handlePointerCancel(e);
        }}
        onPointerLeave={handlePointerLeave}
        onClickCapture={handleClickCapture}
      >
        <div className="absolute inset-0">
          {width > 0 &&
            items.map((item, i) => {
              const isActive = i === current;
              const shown = isActive && introReady;
              // Kept stable per item so a slide change never remounts the card
              // and its enter/exit transitions can play.
              const Card: ElementType = item.href ? "a" : "div";
              const progress =
                typeof item.progress === "number"
                  ? Math.min(1, Math.max(0, item.progress / 100))
                  : 0;
              return (
                <Card
                  key={i}
                  data-nft-card={i}
                  ref={(el: HTMLElement | null) => {
                    // Inline callbacks are detached and re-attached on every
                    // commit; skip the detach so only a real swap draws.
                    if (!el) return;
                    if (el !== cardRefs.current[i]) {
                      pendingDrawRef.current = true;
                    }
                    cardRefs.current[i] = el;
                  }}
                  href={isActive ? item.href : undefined}
                  draggable={false}
                  aria-hidden={isActive ? undefined : true}
                  tabIndex={isActive && item.href ? 0 : undefined}
                  onClick={() => {
                    if (!isActive) goTo(i);
                  }}
                  className="focus-visible:ring-ring/50 absolute top-1/2 left-1/2 block cursor-[inherit] outline-none select-none focus-visible:ring-2"
                  style={{
                    width: cardW,
                    height: cardH,
                    marginLeft: -cardW / 2,
                    marginTop: -cardH / 2,
                    borderRadius: radius,
                    boxShadow: "0 28px 64px rgb(0 0 0 / 0.14)",
                    willChange: "transform",
                  }}
                >
                  {/* One clip-path mask on the composited group, so the image
                      edge and the overlay edge cannot leave a corner seam. */}
                  <div
                    className={cn(
                      "absolute inset-0",
                      !item.background && "bg-muted",
                    )}
                    style={{
                      background: item.background,
                      clipPath: `inset(0 round ${radius}px)`,
                      transform: pressed === i ? "scale(0.97)" : undefined,
                      transition: reduced ? "none" : "transform 100ms ease-out",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      ref={(el) => {
                        imgRefs.current[i] = el;
                      }}
                      src={item.image}
                      alt=""
                      aria-hidden="true"
                      draggable={false}
                      loading="lazy"
                      decoding="async"
                      className={cn(
                        "absolute inset-0 h-full w-full object-cover",
                        item.pixelated && "[image-rendering:pixelated]",
                      )}
                    />

                    <div className="pointer-events-none absolute inset-0">
                      <div
                        aria-hidden="true"
                        className={cn(
                          "from-card via-card/95 absolute -inset-x-px -bottom-px bg-linear-to-t via-40% to-transparent",
                          compact ? "h-[66%]" : "h-[56%]",
                        )}
                        style={gradientStyle(shown)}
                      />

                      {item.stat ? (
                        <div
                          className="bg-background/60 absolute top-4 left-4 flex items-center gap-2 rounded-full border border-white/60 py-1 pr-3 pl-1 backdrop-blur-md backdrop-saturate-150 dark:border-white/10"
                          style={reveal(shown, 360, 120, -6)}
                        >
                          <span className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-full">
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2.4}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                              // Point down for a negative move like "-12%".
                              className={cn(
                                "size-3",
                                /^[-−]/.test(item.stat.trim()) && "rotate-90",
                              )}
                            >
                              <path d="M7 17 17 7M8 7h9v9" />
                            </svg>
                          </span>
                          <span className="text-xs font-medium tabular-nums">
                            {item.stat}
                          </span>
                        </div>
                      ) : null}

                      {item.ticker ? (
                        <div
                          className="bg-background/60 text-foreground absolute top-4 right-4 rounded-full border border-white/60 px-3 py-1.5 text-xs font-medium backdrop-blur-md backdrop-saturate-150 dark:border-white/10"
                          style={reveal(shown, 360, 120, -6)}
                        >
                          {item.ticker}
                        </div>
                      ) : null}

                      <div
                        className={cn(
                          "text-card-foreground absolute inset-x-0 bottom-0",
                          compact ? "p-4" : "p-5",
                        )}
                      >
                        {item.description ? (
                          <p
                            className={cn(
                              "leading-snug",
                              compact
                                ? "line-clamp-3 text-[15px]"
                                : cn(
                                    "line-clamp-4",
                                    cardW < 380 ? "text-lg" : "text-xl",
                                  ),
                            )}
                            style={reveal(shown, 420, 160, 8)}
                          >
                            {item.description}
                          </p>
                        ) : null}
                        <div
                          className="mt-3 flex items-end justify-between gap-3"
                          style={reveal(shown, 420, 200, 8)}
                        >
                          <div className="flex min-w-0 flex-wrap items-baseline gap-x-2">
                            <span className="font-medium">{item.name}</span>
                            {item.creator ? (
                              <span className="text-muted-foreground text-sm">
                                {item.creator}
                              </span>
                            ) : null}
                          </div>
                          {item.marketCap ? (
                            <span className="text-muted-foreground shrink-0 text-sm tabular-nums">
                              MC {item.marketCap}
                            </span>
                          ) : null}
                        </div>
                        {typeof item.progress === "number" ? (
                          <div
                            className="mt-3"
                            style={reveal(shown, 420, 240, 8)}
                          >
                            <div className="text-muted-foreground flex items-center justify-between text-xs">
                              <span>
                                {item.progress >= 100
                                  ? "Graduated"
                                  : "Bonding curve"}
                              </span>
                              <span className="tabular-nums">
                                {item.progress}%
                              </span>
                            </div>
                            <div className="bg-foreground/10 mt-1.5 h-1.5 overflow-hidden rounded-full">
                              <div
                                className="bg-primary h-full w-full origin-left rounded-full"
                                style={{
                                  transform: reduced
                                    ? `scaleX(${progress})`
                                    : `scaleX(${shown ? progress : 0})`,
                                  transition: reduced
                                    ? "none"
                                    : shown
                                      ? `transform 600ms ${EASE} 280ms`
                                      : `transform 160ms ${EASE}`,
                                }}
                              />
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div
                      aria-hidden="true"
                      className="bg-background/60 text-foreground absolute bottom-4 left-4 rounded-full border border-white/60 px-3 py-1.5 text-xs font-medium backdrop-blur-md backdrop-saturate-150 dark:border-white/10"
                      style={{
                        opacity: shown ? 0 : 1,
                        transform: reduced
                          ? undefined
                          : `translateY(${shown ? 4 : 0}px)`,
                        transition: reduced
                          ? `opacity 200ms ${EASE}`
                          : shown
                            ? `opacity 120ms ${EASE}, transform 120ms ${EASE}`
                            : `opacity 280ms ${EASE} 240ms, transform 280ms ${EASE} 240ms`,
                      }}
                    >
                      {item.name}
                    </div>
                  </div>
                </Card>
              );
            })}
        </div>
      </div>

      <div
        role="group"
        aria-label="Choose slide"
        className="relative z-10 mt-7 flex flex-wrap items-center justify-center gap-0"
        style={dotsStyle}
      >
        {items.map((item, i) => {
          const isActive = i === current;
          return (
            <button
              key={i}
              type="button"
              aria-current={isActive ? "true" : undefined}
              aria-label={`Show ${item.name}`}
              onClick={() => goTo(i)}
              className="focus-visible:ring-ring/50 flex h-8 min-w-6 items-center justify-center rounded-full transition-transform duration-100 ease-out outline-none focus-visible:ring-2 active:scale-90 motion-reduce:transition-none"
            >
              <span
                className={cn(
                  "bg-foreground/20 relative block h-2 rounded-full transition-[width] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                  isActive ? "w-11" : "w-2",
                )}
              >
                {isActive ? (
                  <span
                    ref={fillRef}
                    className="bg-primary absolute inset-0 origin-left rounded-full"
                    style={{ transform: "scaleX(0)" }}
                  />
                ) : null}
              </span>
            </button>
          );
        })}
      </div>

      <span
        aria-live={paused ? "polite" : "off"}
        aria-atomic="true"
        className="sr-only"
      >
        {count > 0
          ? `Slide ${current + 1} of ${count}: ${items[current]?.name ?? ""}`
          : ""}
      </span>
    </div>
  );
}
