"use client";

import {
  ArrowLeftRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { motion, useInView } from "motion/react";
import Image from "next/image";
import {
  Fragment,
  useId,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type RefObject,
  type CSSProperties,
} from "react";

import { cn } from "@/lib/utils";

export interface RouteAsset {
  symbol: string;
  chain: string;
  /** Token logo. Without it the symbol's first letter is shown. */
  logo?: string;
  /** Chain badge on the token. Hidden when missing or `native`. */
  chainLogo?: string;
  /** The chain's own coin (ETH on Ethereum): shown without a chain badge. */
  native?: boolean;
}

export interface RouteSegment {
  kind: "swap" | "bridge";
  from: RouteAsset;
  to: RouteAsset;
  /** Protocol that runs this hop, e.g. "Uniswap" or "Circle CCTP". */
  via: string;
}

export type RouteStepState = "done" | "active" | "pending" | "failed";

export interface RouteTrackerLabels {
  swap: string;
  bridge: string;
  /** Suffix for a swap's chain line, e.g. "on Solana". */
  on: (chain: string) => string;
  step: (current: number, total: number) => string;
  steps: (total: number) => string;
  completed: string;
  failed: string;
  /** Screen-reader words for each step state. */
  states: Record<RouteStepState, string>;
  /** Screen-reader prefix for the estimate. */
  eta: string;
  /** Screen-reader suffix for the percentage. */
  percent: string;
  explorer: string;
}

export interface RouteTrackerProps {
  segments: RouteSegment[];
  /** Index of the hop in progress; `segments.length` means finished. */
  active: number;
  /** The active hop failed. */
  failed?: boolean;
  title?: string;
  /** Heading level for the title, to fit the page outline. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Estimated duration, e.g. "~3 min". Hidden once the route ends. */
  eta?: string;
  /** Explorer link for the route. */
  href?: string;
  /** Route tile colour. Text on it switches to light or dark automatically. */
  accent?: string;
  /** Header badge and active-step colour. */
  highlight?: string;
  /** Force the single-column layout, e.g. inside a narrow sidebar. */
  stacked?: boolean;
  labels?: Partial<RouteTrackerLabels>;
  className?: string;
}

type Dir = "right" | "left" | "down";
type Link = { kind: "bridge"; index: number } | { kind: "turn" };

const EASE = [0.22, 1, 0.36, 1] as const;
const INK_DARK = "#000000";

const DEFAULT_LABELS: RouteTrackerLabels = {
  swap: "Swap",
  bridge: "Bridge",
  on: (chain) => `on ${chain}`,
  step: (current, total) => `Step ${current} of ${total}`,
  steps: (total) => `${total} steps`,
  completed: "Completed",
  failed: "Route failed",
  states: {
    done: "completed",
    active: "in progress",
    failed: "failed",
    pending: "not started",
  },
  eta: "Estimated time",
  percent: "complete",
  explorer: "View route in explorer (opens in a new tab)",
};

// Decorative motion is off on the server and for reduced-motion users. The
// server snapshot keeps hydration consistent; the client updates after.
const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";
const subscribeMotion = (onChange: () => void) => {
  const media = window.matchMedia(REDUCE_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
};
const useMotionAllowed = () =>
  useSyncExternalStore(
    subscribeMotion,
    () => !window.matchMedia(REDUCE_QUERY).matches,
    () => false,
  );

const INK_LIGHT = "#ffffff";
const NAMED: Record<string, string> = {
  black: "#000000",
  white: "#ffffff",
  gray: "#808080",
  grey: "#808080",
  silver: "#c0c0c0",
  red: "#ff0000",
  maroon: "#800000",
  orange: "#ffa500",
  yellow: "#ffff00",
  olive: "#808000",
  lime: "#00ff00",
  green: "#008000",
  aqua: "#00ffff",
  cyan: "#00ffff",
  teal: "#008080",
  blue: "#0000ff",
  navy: "#000080",
  fuchsia: "#ff00ff",
  magenta: "#ff00ff",
  purple: "#800080",
};

type RGBA = [number, number, number, number];

// sRGB channels (0-255) plus alpha (0-1) for hex (3/4/6/8 digits),
// rgb()/rgba() or a basic named colour. Used on the server and first render.
function parseColor(input: string): RGBA | null {
  const value = input.trim().toLowerCase();
  const hex = /^#?([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/.exec(
    NAMED[value] ?? value,
  );
  if (hex) {
    const h = hex[1].length <= 4 ? hex[1].replace(/./g, "$&$&") : hex[1];
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
    const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
    return [r, g, b, a];
  }
  const fn = /^rgba?\(([^)]+)\)$/.exec(value);
  if (!fn) return null;
  const parts = fn[1].split(/[\s,/]+/).filter(Boolean);
  if (parts.length < 3) return null;
  const num = (p: string, max: number) =>
    p.endsWith("%") ? (parseFloat(p) / 100) * max : parseFloat(p);
  const rgba = [
    num(parts[0], 255),
    num(parts[1], 255),
    num(parts[2], 255),
    parts[3] === undefined ? 1 : num(parts[3], 1),
  ];
  return rgba.every(Number.isFinite) ? (rgba as RGBA) : null;
}

// Any colour the browser understands (oklch(), hsl(), color-mix() ...),
// resolved to sRGB through a 1x1 canvas. Client only.
function resolveColor(color: string): RGBA | null {
  const ctx = document
    .createElement("canvas")
    .getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  const sentinel = "#010203";
  ctx.fillStyle = sentinel;
  ctx.fillStyle = color;
  if (ctx.fillStyle === sentinel && color.trim() !== sentinel) return null;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
  return [r, g, b, a / 255];
}

// Flattens a translucent colour onto the (opaque) surface behind it.
const over = ([r, g, b, a]: RGBA, [br, bg, bb]: RGBA): RGBA => [
  r * a + br * (1 - a),
  g * a + bg * (1 - a),
  b * a + bb * (1 - a),
  1,
];

const luminance = ([r, g, b]: RGBA) => {
  const [lr, lg, lb] = [r, g, b].map((v) => {
    const c = Math.min(Math.max(v, 0), 255) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
};

const contrast = (a: number, b: number) =>
  (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

const WHITE: RGBA = [255, 255, 255, 1];

// Whichever ink (black or white) has the higher contrast ratio against an
// opaque background.
const pickInk = (bg: RGBA) =>
  contrast(luminance(bg), 0) >= contrast(luminance(bg), 1)
    ? INK_DARK
    : INK_LIGHT;

// First-render ink: parsed colour flattened onto white (the server cannot
// know the theme). Unsupported formats keep dark ink until the client
// resolves them.
function inkOn(color: string) {
  const rgba = parseColor(color);
  return rgba ? pickInk(over(rgba, WHITE)) : INK_DARK;
}

// Exact ink after mount: the browser resolves the colour (any format) and
// translucent colours are flattened onto the card's real background. Re-runs
// when the theme changes on <html>.
function useInk(color: string, surface: RefObject<HTMLElement | null>) {
  const [ink, setInk] = useState<string | null>(null);
  useEffect(() => {
    const el = surface.current;
    if (!el) return;
    const update = () => {
      const fg = resolveColor(color);
      if (!fg) return setInk(null);
      const bg = resolveColor(getComputedStyle(el).backgroundColor);
      setInk(pickInk(over(fg, bg && bg[3] > 0 ? bg : WHITE)));
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme"],
    });
    return () => observer.disconnect();
  }, [color, surface]);
  return ink ?? inkOn(color);
}

// Snake layout: every swap gets its own row and rows alternate direction.
// Vertical links hang off the end of a row: bridge hops (one or several in a
// row) or a plain turn carrying the same token down to the next swap.
function layout(segments: RouteSegment[]) {
  const rows: number[] = [];
  const links: Link[][] = [];
  segments.forEach((seg, i) => {
    const last = rows.length - 1;
    if (seg.kind === "bridge" && last >= 0) {
      (links[last] ??= []).push({ kind: "bridge", index: i });
      return;
    }
    if (last >= 0 && !links[last]?.length) links[last] = [{ kind: "turn" }];
    rows.push(i);
  });
  return { rows, links };
}

function Token({ asset, dim }: { asset: RouteAsset; dim?: boolean }) {
  const badge =
    asset.chainLogo && !asset.native && asset.chainLogo !== asset.logo;
  return (
    <div
      title={`${asset.symbol} on ${asset.chain}`}
      className={cn(
        "flex w-11 shrink-0 flex-col items-center gap-1 transition-opacity duration-500 motion-reduce:transition-none",
        dim && "opacity-45",
      )}
    >
      <span className="relative size-8">
        {asset.logo ? (
          <Image
            src={asset.logo}
            alt=""
            width={32}
            height={32}
            className="size-8 rounded-full bg-white"
          />
        ) : (
          <span className="grid size-8 place-items-center rounded-full bg-white text-xs font-bold text-neutral-950">
            {asset.symbol.charAt(0).toUpperCase()}
          </span>
        )}
        {badge && (
          <Image
            src={asset.chainLogo!}
            alt=""
            width={14}
            height={14}
            className="absolute -right-1 -bottom-0.5 size-3.5 rounded-full bg-white ring-2 ring-(--rt-accent)"
          />
        )}
      </span>
      <span className="max-w-full truncate text-[10px] leading-none font-semibold">
        {asset.symbol}
      </span>
    </div>
  );
}

// Directional connector: a dashed track, a solid fill that grows from the
// source side when the hop completes, a dot that travels the same way while
// the hop is active, and an arrowhead at the destination end. A failed hop
// stays dashed (it never arrived) and turns red.
function Wire({
  state,
  dir,
  live,
  animate,
}: {
  state: RouteStepState | "idle";
  dir: Dir;
  /** Run the looping travel dot. */
  live: boolean;
  /** Animate state changes. */
  animate: boolean;
}) {
  const down = dir === "down";
  const filled = state === "done";
  const lit = filled || state === "active" || state === "failed";
  const Arrow = down
    ? ChevronDown
    : dir === "left"
      ? ChevronLeft
      : ChevronRight;
  const path = dir === "left" ? ["100%", "0%"] : ["0%", "100%"];

  return (
    <span
      className={cn(
        "flex items-center",
        down ? "h-full flex-col" : "w-full",
        dir === "left" && "flex-row-reverse",
        state === "failed" ? "text-red-600" : "text-(--rt-ink)",
      )}
    >
      <span
        className={cn(
          "relative flex-1 rounded-full transition-opacity duration-300 motion-reduce:transition-none",
          down
            ? "w-[1.5px] bg-[repeating-linear-gradient(180deg,currentColor_0_3px,transparent_3px_6px)]"
            : "h-[1.5px] bg-[repeating-linear-gradient(90deg,currentColor_0_3px,transparent_3px_6px)]",
          lit ? "opacity-100" : "opacity-30",
        )}
      >
        <motion.span
          className={cn(
            "absolute inset-0 rounded-full bg-current",
            down
              ? "origin-top"
              : dir === "left"
                ? "origin-right"
                : "origin-left",
          )}
          initial={false}
          animate={
            down ? { scaleY: filled ? 1 : 0 } : { scaleX: filled ? 1 : 0 }
          }
          transition={{ duration: animate ? 0.6 : 0, ease: EASE }}
        />
        {state === "active" && live && (
          <motion.span
            className="absolute size-[7px] rounded-full border border-(--rt-ink) bg-(--rt-highlight)"
            style={
              down
                ? { left: "50%", marginLeft: -3.5, marginTop: -3.5 }
                : { top: "50%", marginTop: -3.5, marginLeft: -3.5 }
            }
            animate={down ? { top: path } : { left: path }}
            transition={{ duration: 1.3, ease: "easeInOut", repeat: Infinity }}
          />
        )}
      </span>
      <Arrow
        aria-hidden
        className={cn(
          "size-3 shrink-0 transition-opacity duration-300 motion-reduce:transition-none",
          down ? "-mt-1" : dir === "left" ? "-mr-1" : "-ml-1",
          lit ? "opacity-100" : "opacity-30",
        )}
        strokeWidth={2.75}
      />
    </span>
  );
}

// Visual route map. Hidden from assistive tech: the step list carries the
// same information as text.
function RouteMap({
  segments,
  stateOf,
  live,
  animate,
}: {
  segments: RouteSegment[];
  stateOf: (i: number) => RouteStepState;
  live: boolean;
  animate: boolean;
}) {
  const { rows, links } = layout(segments);
  const hidden = (s: RouteStepState) => s === "pending" || s === "failed";

  return (
    <div aria-hidden className="my-auto flex flex-col pt-2.5">
      {rows.map((segIndex, r) => {
        const seg = segments[segIndex];
        const rtl = r % 2 === 1;
        const state = stateOf(segIndex);
        const chain = links[r] ?? [];
        const lastRow = r === rows.length - 1;
        // Links hang off the side where this row ended.
        const side = rtl ? "" : "justify-end";

        return (
          <Fragment key={segIndex}>
            <div className={cn("flex items-start", rtl && "flex-row-reverse")}>
              <Token asset={seg.from} dim={state === "pending"} />
              <div className="flex flex-1 items-center px-1.5 pt-4">
                <Wire
                  state={state}
                  dir={rtl ? "left" : "right"}
                  live={live}
                  animate={animate}
                />
              </div>
              <Token asset={seg.to} dim={hidden(state)} />
            </div>

            {chain.map((link, j) => {
              const linkState: RouteStepState | "idle" =
                link.kind === "bridge"
                  ? stateOf(link.index)
                  : state === "done"
                    ? "done"
                    : "idle";
              // A bridge's destination token is drawn here unless the next
              // row starts with it.
              const showTo =
                link.kind === "bridge" && (j < chain.length - 1 || lastRow);
              return (
                <Fragment key={j}>
                  <div className={cn("flex h-6", side)}>
                    <div className="flex w-11 shrink-0 justify-center py-0.5">
                      <Wire
                        state={linkState}
                        dir="down"
                        live={live}
                        animate={animate}
                      />
                    </div>
                  </div>
                  {showTo && (
                    <div className={cn("flex", side)}>
                      <Token
                        asset={segments[link.index].to}
                        dim={hidden(stateOf(link.index))}
                      />
                    </div>
                  )}
                </Fragment>
              );
            })}
          </Fragment>
        );
      })}
    </div>
  );
}

function RouteTrackerCard({
  segments,
  active,
  failed = false,
  title = "Bridge route",
  headingLevel = 3,
  eta,
  href,
  accent = "#b0a2f6",
  highlight = "#a6ec8f",
  stacked = false,
  labels,
  className,
}: RouteTrackerProps) {
  const ref = useRef<HTMLElement>(null);
  const titleId = useId();
  const motionAllowed = useMotionAllowed();
  // Looping decorations pause while the card is off-screen.
  const inView = useInView(ref, { margin: "120px" });
  const live = motionAllowed && inView;
  const t = { ...DEFAULT_LABELS, ...labels };
  const accentInk = useInk(accent, ref);
  const highlightInk = useInk(highlight, ref);

  const total = segments.length;
  const done = Math.min(
    Math.max(Number.isFinite(active) ? Math.floor(active) : 0, 0),
    total,
  );
  const finished = done >= total;
  const isFailed = failed && !finished;
  const ended = finished || isFailed;
  const stateOf = (i: number): RouteStepState =>
    i < done
      ? "done"
      : i === done
        ? isFailed
          ? "failed"
          : "active"
        : "pending";
  const pct = Math.round((done / total) * 100);
  const statusText = isFailed
    ? t.failed
    : finished
      ? t.completed
      : t.step(done + 1, total);
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4" | "h5" | "h6";

  return (
    <section
      ref={ref}
      aria-labelledby={titleId}
      style={
        {
          "--rt-accent": accent,
          "--rt-highlight": highlight,
          "--rt-ink": isFailed ? INK_DARK : accentInk,
        } as CSSProperties
      }
      className={cn(
        "bg-card text-card-foreground grid w-full max-w-[540px] gap-6 rounded-[32px] p-5 shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.04),0_4px_8px_-2px_rgba(0,0,0,0.05),0_16px_32px_-8px_rgba(0,0,0,0.08),0_40px_80px_-24px_rgba(0,0,0,0.14)] max-[400px]:rounded-[26px] max-[400px]:p-4 dark:ring-1 dark:ring-white/10",
        stacked
          ? "grid-cols-1 gap-5 rounded-[26px] p-4"
          : "grid-cols-[minmax(0,1fr)_auto] max-[600px]:grid-cols-1 max-[600px]:gap-5",
        className,
      )}
    >
      {/* Left: title + route map */}
      <div className="flex min-w-0 flex-col gap-4">
        <div
          className={cn(
            "flex items-center gap-3 max-[400px]:gap-2.5",
            stacked && "gap-2.5",
          )}
        >
          <span
            className={cn(
              "grid size-12 shrink-0 place-items-center rounded-full bg-(--rt-highlight) max-[400px]:size-9",
              stacked && "size-9",
            )}
            style={{ color: highlightInk }}
          >
            <span className="grid size-6 place-items-center rounded-md border-[1.5px] border-current">
              <ArrowLeftRight className="size-3.5" strokeWidth={2.2} />
            </span>
          </span>
          <Heading
            id={titleId}
            title={title}
            className={cn(
              "min-w-0 truncate text-xl leading-tight font-semibold tracking-tight max-[400px]:text-base",
              stacked && "text-base",
            )}
          >
            {title}
          </Heading>
          <p
            className={cn(
              "text-muted-foreground ml-auto shrink-0 text-base leading-tight font-semibold tracking-tight tabular-nums max-[400px]:text-xs",
              stacked && "text-xs",
            )}
          >
            {/* The estimate only means something while the route runs. */}
            {eta && !ended && (
              <>
                <span className="sr-only">{t.eta} </span>
                {eta} ·{" "}
              </>
            )}
            <span className="text-foreground">{pct}%</span>
            <span className="sr-only"> {t.percent}</span>
          </p>
        </div>

        <div
          className={cn(
            "flex flex-1 flex-col rounded-3xl p-3.5 text-(--rt-ink) transition-colors duration-500 motion-reduce:transition-none",
            isFailed ? "bg-red-200 dark:bg-red-300" : "bg-(--rt-accent)",
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="flex min-w-0 items-baseline gap-1.5 text-[14.5px] font-medium whitespace-nowrap max-[400px]:text-[13px]">
              <span aria-live="polite" className="font-semibold">
                {statusText}
              </span>
              {/* "Step x of y" already carries the count. */}
              {ended && (
                <span className="truncate opacity-80">· {t.steps(total)}</span>
              )}
            </p>
            {href && (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t.explorer}
                className="group/arrow relative grid size-6 shrink-0 place-items-center overflow-hidden rounded-full outline-none focus-visible:ring-2 focus-visible:ring-current"
              >
                {/* Hover: the arrow flies out up-right and a copy slides in
                    from bottom-left. */}
                <ArrowUpRight
                  aria-hidden
                  className="size-4 transition-transform duration-300 ease-out group-hover/arrow:translate-x-5 group-hover/arrow:-translate-y-5 group-focus-visible/arrow:translate-x-5 group-focus-visible/arrow:-translate-y-5 motion-reduce:transition-none"
                />
                <ArrowUpRight
                  aria-hidden
                  className="absolute size-4 -translate-x-5 translate-y-5 transition-transform duration-300 ease-out group-hover/arrow:translate-x-0 group-hover/arrow:translate-y-0 group-focus-visible/arrow:translate-x-0 group-focus-visible/arrow:translate-y-0 motion-reduce:transition-none"
                />
              </a>
            )}
          </div>
          <RouteMap
            segments={segments}
            stateOf={stateOf}
            live={live}
            animate={motionAllowed}
          />
        </div>
      </div>

      {/* Right: steps. Each connector draws itself when its step completes;
          the active step's connector shows a flowing highlight. */}
      <ol
        className={cn(
          "flex h-full min-w-0 flex-col",
          stacked
            ? "max-w-none"
            : "max-w-56 pt-1 max-[600px]:max-w-none max-[600px]:pt-0",
        )}
      >
        {segments.map((seg, i) => {
          const s = stateOf(i);
          return (
            <li
              key={i}
              aria-current={s === "active" ? "step" : undefined}
              className="relative flex-1 pb-4 pl-7 last:flex-none last:pb-0"
            >
              {i < total - 1 && (
                <span
                  aria-hidden
                  className="bg-border absolute top-5 bottom-0 left-[7.5px] w-px overflow-hidden"
                >
                  <motion.span
                    className="bg-foreground absolute inset-0 origin-top"
                    initial={false}
                    animate={{ scaleY: s === "done" ? 1 : 0 }}
                    transition={{
                      duration: motionAllowed ? 0.7 : 0,
                      ease: EASE,
                    }}
                  />
                  {s === "active" && live && (
                    <motion.span
                      className="via-foreground absolute inset-x-0 h-1/2 bg-gradient-to-b from-transparent to-transparent"
                      initial={{ top: "-50%" }}
                      animate={{ top: "100%" }}
                      transition={{
                        duration: 1.2,
                        ease: "easeInOut",
                        repeat: Infinity,
                      }}
                    />
                  )}
                </span>
              )}
              <span
                aria-hidden
                className={cn(
                  "absolute top-0.5 left-0 grid size-4 place-items-center rounded-full border transition-colors duration-300 motion-reduce:transition-none",
                  s === "done" &&
                    "border-foreground bg-foreground text-background",
                  s === "pending" && "border-border bg-card",
                  s === "failed" && "border-red-600 bg-red-600 text-white",
                  s === "active" && "border-foreground bg-(--rt-highlight)",
                )}
              >
                {s === "active" && live && (
                  <span className="border-foreground/30 absolute -inset-1 animate-ping rounded-full border" />
                )}
                {(s === "done" || s === "failed") && (
                  <motion.span
                    key={s}
                    initial={motionAllowed ? { scale: 0, rotate: -45 } : false}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 22 }}
                  >
                    {s === "done" ? (
                      <Check className="size-2.5" strokeWidth={4} />
                    ) : (
                      <X className="size-2.5" strokeWidth={4} />
                    )}
                  </motion.span>
                )}
              </span>
              <p
                className={cn(
                  "text-sm font-semibold break-words transition-colors motion-reduce:transition-none",
                  s === "pending" && "text-muted-foreground",
                )}
              >
                {seg.kind === "swap" ? t.swap : t.bridge}
                <span className="text-muted-foreground font-medium">
                  {" "}
                  · {seg.via}
                </span>
                <span className="sr-only">, {t.states[s]}</span>
              </p>
              <p
                className={cn(
                  "mt-1 text-xs leading-snug break-words",
                  s === "failed"
                    ? "text-red-600 dark:text-red-400"
                    : "text-muted-foreground",
                )}
              >
                {seg.from.symbol} → {seg.to.symbol}
                <br />
                {seg.kind === "bridge"
                  ? `${seg.from.chain} → ${seg.to.chain}`
                  : t.on(seg.to.chain)}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

// Renders nothing for an empty route. The card mounts (and its observer
// attaches) once segments arrive.
function RouteTracker(props: RouteTrackerProps) {
  return props.segments.length ? <RouteTrackerCard {...props} /> : null;
}

export default RouteTracker;
export { RouteTracker };
