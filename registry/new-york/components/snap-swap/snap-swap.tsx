"use client";

import {
  ArrowDownUp,
  ChevronDown,
  Pencil,
  Search,
  Wallet,
  X,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  MotionConfig,
  type Variants,
} from "motion/react";
import {
  Fragment,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export interface SnapSwapToken {
  symbol: string;
  name: string;
  logo?: string;
  price: number;
  balance?: number;
  decimals?: number;
}

export interface SnapSwapColors {
  order?: string;
  slippage?: string;
  pay?: string;
  receive?: string;
  details?: string;
  action?: string;
}

export interface SnapSwapHop {
  from: string;
  to: string;
  venue: string;
  share: number; // share in percent
}

export interface SnapSwapQuote {
  amountOut: number;
  minReceived: number;
  priceImpact: number; // in percent
  hops: SnapSwapHop[];
}

export interface SnapSwapQuoteRequest {
  pay: SnapSwapToken;
  receive: SnapSwapToken;
  amount: number;
  /** The amount exactly as typed, for exact base-unit conversion. */
  amountText: string;
  slippage: number; // in percent
  signal: AbortSignal;
}

export interface SnapSwapProps {
  /** Tokens the picker offers, each `{ symbol, name, logo?, price, balance?, decimals? }`. */
  tokens: SnapSwapToken[];
  /** Symbol of the token on the pay side. Defaults to the first token. */
  defaultPay?: string;
  /** Symbol of the token on the receive side. Defaults to the second token. */
  defaultReceive?: string;
  /** Block colours; each value is any CSS colour. */
  colors?: SnapSwapColors;
  className?: string;
  /** Live quote source; on failure or when omitted the component uses its local estimate.
   *  Reject with an Error named "NoRouteError" or "PrecisionError" to show those states. */
  getQuote?: (req: SnapSwapQuoteRequest) => Promise<SnapSwapQuote>;
  /** Name shown in the live badge, e.g. "Jupiter". */
  quoteSource?: string;
  /** Snap the blocks together the first time the card scrolls into view. */
  intro?: boolean;
}

const DEFAULT_COLORS = {
  order: "#dcd3fb",
  slippage: "#f4c6e6",
  pay: "#bfe9dc",
  receive: "#d9f26b",
  details: "#f9d3e9",
  action: "#9fd3f5",
};

const SLIPPAGE_PRESETS = [0.5, 1] as const;
const EXPIRIES = ["1h", "1d", "7d"] as const;
const FEE = 0.003;
const DEPTH_USD = 2_000_000;
const SPRING = { type: "spring", bounce: 0, duration: 0.32 } as const;
const FLIP_SPRING = { type: "spring", bounce: 0.2, duration: 0.45 } as const;
const SHEET_SPRING = { type: "spring", bounce: 0.15, duration: 0.35 } as const;
const QUOTE_TIMEOUT_MS = 10_000;

// Intro: pieces settle into place one after another, no overshoot.
const INTRO: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const PIECE_SPRING = { type: "spring", bounce: 0, duration: 0.4 } as const;
const piece = (x = 0): Variants => ({
  hidden: { opacity: 0, x, y: 8, scale: 0.96 },
  show: { opacity: 1, x: 0, y: 0, scale: 1, transition: PIECE_SPRING },
});
const PIECE = piece();
const PIECE_LEFT = piece(-6);
const PIECE_RIGHT = piece(6);
const FLIP_PIECE: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { ...PIECE_SPRING, delay: 0.3 },
  },
};

const VENUES = ["Orca", "Raydium", "Meteora", "Phoenix", "Lifinity"] as const;

/** Local fallback route used when no live quote is available. */
function demoHops(pay: string, receive: string): SnapSwapHop[] {
  const hash = (pay + receive)
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const isSolOrUsdc = (token: string) => token === "SOL" || token === "USDC";
  if (!isSolOrUsdc(pay) && !isSolOrUsdc(receive)) {
    return [
      { from: pay, to: "USDC", venue: VENUES[hash % 5], share: 100 },
      { from: "USDC", to: receive, venue: VENUES[(hash + 1) % 5], share: 100 },
    ];
  }
  const a = VENUES[hash % 5];
  const b = VENUES[(hash + 2) % 5];
  const shareA = 55 + (hash % 30);
  return [
    { from: pay, to: receive, venue: a, share: shareA },
    { from: pay, to: receive, venue: b, share: 100 - shareA },
  ];
}

type Side = "pay" | "receive";
type Mode = "market" | "limit";
type Status = "idle" | "pending" | "success";

const FALLBACK_TOKEN: SnapSwapToken = {
  symbol: "TOKEN",
  name: "Unknown token",
  price: 0,
};

/* -------------------------------------------------------------------------- */
/*  Helpers (copied from swap-panel)                                          */
/* -------------------------------------------------------------------------- */

/** Accepts plain decimals only ("1", "1.", ".5"); anything else (signs,
 *  exponents, letters) returns null so the caller keeps the previous value. */
function parseDecimalInput(raw: string) {
  const value = raw.trim();
  if (value.length > 24 || !/^\d*\.?\d*$/.test(value)) return null;
  return value;
}

function formatAmount(value: number, maxFractionDigits = 6, roundDown = false) {
  if (!Number.isFinite(value) || value <= 0) return "0";
  const digits =
    maxFractionDigits === 0
      ? 0
      : value >= 1000
        ? Math.min(maxFractionDigits, 2)
        : value >= 1
          ? Math.min(maxFractionDigits, 4)
          : maxFractionDigits;
  if (roundDown) {
    value = Math.floor(value * 10 ** digits) / 10 ** digits;
  }
  const smallest = 10 ** -Math.max(0, digits);
  // Never let a positive amount round down to "0".
  if (value < smallest) {
    return digits > 0 ? `<0.${"0".repeat(digits - 1)}1` : "<1";
  }
  return value.toLocaleString("en-US", {
    maximumFractionDigits: Math.max(0, digits),
  });
}

function plainNumber(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "";
  return value.toLocaleString("en-US", {
    useGrouping: false,
    maximumSignificantDigits: 8,
  });
}

function exactNumber(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "";
  const s = String(value);
  return s.includes("e")
    ? value.toLocaleString("en-US", {
        useGrouping: false,
        maximumSignificantDigits: 17,
      })
    : s;
}

function formatUsd(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "$0.00";
  if (value < 0.01) return "<$0.01";
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}

function compactNumber(value: number, roundDown = false) {
  if (!Number.isFinite(value) || value < 100000) return null;
  const opts: Intl.NumberFormatOptions & { roundingMode?: string } = {
    notation: "compact",
    maximumFractionDigits: 2,
  };
  if (roundDown) opts.roundingMode = "floor";
  return new Intl.NumberFormat("en-US", opts).format(value);
}

function amountTextSize(value: string) {
  const len = value.length;
  if (len <= 12) return "text-4xl";
  if (len <= 15) return "text-3xl";
  return "text-2xl";
}

function TokenLogo({
  token,
  className,
}: {
  token: SnapSwapToken;
  className?: string;
}) {
  const [failedSrc, setFailedSrc] = useState<string>();

  if (!token.logo || failedSrc === token.logo) {
    return (
      <span
        aria-hidden
        className={cn(
          "grid shrink-0 place-items-center rounded-full bg-neutral-950/10 text-[11px] font-semibold text-neutral-950",
          className,
        )}
      >
        {token.symbol.charAt(0).toUpperCase()}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={token.logo}
      alt=""
      width={24}
      height={24}
      draggable={false}
      onError={() => setFailedSrc(token.logo)}
      className={cn("shrink-0 rounded-full object-cover", className)}
    />
  );
}

function RollingNumber({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const chars = value.split("");
  return (
    <span className={cn("inline-flex tabular-nums", className)}>
      <span className="sr-only">{value}</span>
      <span aria-hidden className="inline-flex">
        <AnimatePresence mode="popLayout" initial={false}>
          {chars.map((char, i) => {
            const isDigit = /\d/.test(char);
            if (!isDigit) {
              return (
                <motion.span
                  key={chars.length - i}
                  layout
                  initial={{ opacity: 0, y: "0.35em", filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: "-0.35em", filter: "blur(4px)" }}
                  transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                  className="inline-block h-[1.15em] leading-[1.15em]"
                >
                  {char}
                </motion.span>
              );
            }
            const digit = Number(char);
            return (
              <motion.span
                key={chars.length - i}
                layout
                initial={{ opacity: 0, y: "0.35em", filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: "-0.35em", filter: "blur(4px)" }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                className="relative inline-block h-[1.15em] overflow-hidden"
                style={{
                  maskImage:
                    "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)",
                  WebkitMaskImage:
                    "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)",
                }}
              >
                <span className="invisible block h-[1.15em] leading-[1.15em]">
                  {char}
                </span>
                <motion.span
                  aria-hidden
                  initial={false}
                  animate={{ y: `${-digit * 1.15}em` }}
                  transition={{ type: "spring", bounce: 0, duration: 0.55 }}
                  className="absolute inset-x-0 top-0"
                >
                  {Array.from({ length: 10 }, (_, d) => (
                    <span
                      key={d}
                      className="block h-[1.15em] text-center leading-[1.15em]"
                    >
                      {d}
                    </span>
                  ))}
                </motion.span>
              </motion.span>
            );
          })}
        </AnimatePresence>
      </span>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Puzzle tab helper                                                         */
/* -------------------------------------------------------------------------- */

/** Puzzle tab: the parent block grows a tab across one edge into its
 *  neighbour, which gets a matching notch outlined in the frame colour.
 *  One SVG per tab so curves share centres and have no seams. Parent must be
 *  `relative` and stacked above the neighbour. `size` is in px. */
function PuzzleTab({
  color,
  side = "bottom",
  at,
  size,
  depth = 10,
  gap = 2,
  radius = 5,
}: {
  color: string;
  side?: "bottom" | "right" | "left";
  at: string;
  size: number;
  depth?: number;
  gap?: number;
  radius?: number;
}) {
  const r = radius;
  const g = gap;
  const inner = r - g;
  const outer = r + g;
  const pad = r + 1;
  const length = size + pad * 2;
  const across = g * 2 + depth + 1;
  const a0 = pad;
  const a1 = pad + size;
  const tip = g + depth;

  // (along, across-from-parent-edge) -> svg coordinates
  const pt = (a: number, c: number) => {
    const y = c + 1;
    if (side === "bottom") return `${a} ${y}`;
    if (side === "right") return `${y} ${a}`;
    return `${across - y} ${a}`;
  };
  // "right" mirrors the axes, which flips arc direction
  const arc = (rad: number, sweep: 0 | 1, a: number, c: number) =>
    `A ${rad} ${rad} 0 0 ${side === "right" ? 1 - sweep : sweep} ${pt(a, c)}`;

  const notch = [
    `M ${pt(a0 - r, -1)}`,
    `L ${pt(a0 - r, g)}`,
    arc(inner, 1, a0 - g, r),
    `L ${pt(a0 - g, tip - r)}`,
    arc(outer, 0, a0 + r, tip + g),
    `L ${pt(a1 - r, tip + g)}`,
    arc(outer, 0, a1 + g, tip - r),
    `L ${pt(a1 + g, r)}`,
    arc(inner, 1, a1 + r, g),
    `L ${pt(a1 + r, -1)}`,
    "Z",
  ].join(" ");

  const tab = [
    `M ${pt(a0 - r, -1)}`,
    `L ${pt(a0 - r, 0)}`,
    arc(r, 1, a0, r),
    `L ${pt(a0, tip - r)}`,
    arc(r, 0, a0 + r, tip),
    `L ${pt(a1 - r, tip)}`,
    arc(r, 0, a1, tip - r),
    `L ${pt(a1, r)}`,
    arc(r, 1, a1 + r, 0),
    `L ${pt(a1 + r, -1)}`,
    "Z",
  ].join(" ");

  const bottom = side === "bottom";
  const svgStyle: React.CSSProperties = bottom
    ? { top: -1, left: `calc(${at} - ${pad}px)` }
    : side === "right"
      ? { left: -1, top: `calc(${at} - ${pad}px)` }
      : { right: -1, top: `calc(${at} - ${pad}px)` };

  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute",
        bottom
          ? "inset-x-0 top-full h-0"
          : side === "right"
            ? "inset-y-0 left-full w-0"
            : "inset-y-0 right-full w-0",
      )}
    >
      <svg
        className="absolute overflow-visible"
        style={svgStyle}
        width={bottom ? length : across}
        height={bottom ? across : length}
        viewBox={`0 0 ${bottom ? length : across} ${bottom ? across : length}`}
      >
        <path d={notch} fill="var(--ss-frame)" />
        <path d={tab} fill={color} />
      </svg>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function SnapSwap({
  tokens,
  defaultPay,
  defaultReceive,
  colors,
  className,
  getQuote,
  quoteSource,
  intro = true,
}: SnapSwapProps) {
  const uid = useId();

  // Defaults must exist in `tokens`, and the two sides start distinct.
  const [paySymbol, setPaySymbol] = useState<string>(
    () =>
      tokens.find((t) => t.symbol === defaultPay)?.symbol ??
      tokens[0]?.symbol ??
      FALLBACK_TOKEN.symbol,
  );
  const [receiveSymbol, setReceiveSymbol] = useState<string>(() => {
    const initialPay =
      tokens.find((t) => t.symbol === defaultPay)?.symbol ?? tokens[0]?.symbol;
    const preferred = tokens.find(
      (t) => t.symbol === defaultReceive && t.symbol !== initialPay,
    );
    return (
      preferred?.symbol ??
      tokens.find((t) => t.symbol !== initialPay)?.symbol ??
      FALLBACK_TOKEN.symbol
    );
  });

  // Resolve the user's chosen symbols against the current `tokens` on every
  // render, so a list that fills in later (or loses a token) re-resolves.
  const pay =
    tokens.find((t) => t.symbol === paySymbol) ??
    tokens.find((t) => t.symbol === defaultPay) ??
    tokens[0] ??
    FALLBACK_TOKEN;
  const receive =
    tokens.find((t) => t.symbol === receiveSymbol && t.symbol !== pay.symbol) ??
    tokens.find(
      (t) => t.symbol === defaultReceive && t.symbol !== pay.symbol,
    ) ??
    tokens.find((t) => t.symbol !== pay.symbol) ??
    FALLBACK_TOKEN;

  const latestTokens = useRef({ pay, receive });
  // eslint-disable-next-line react-hooks/refs
  latestTokens.current = { pay, receive };

  const pair = JSON.stringify([pay.symbol, receive.symbol]);

  const [mode, setMode] = useState<Mode>("market");
  const [amount, setAmount] = useState("");
  const [limitInput, setLimitInput] = useState<string | null>(null);
  const [slippage, setSlippage] = useState(0.5);
  const [slippageMode, setSlippageMode] = useState<
    "auto" | "preset" | "custom"
  >("auto");
  const [customSlippage, setCustomSlippage] = useState("0.5");
  const [expiry, setExpiry] = useState<"1h" | "1d" | "7d">("1d");
  const [liveQuote, setLiveQuote] = useState<{
    quote: SnapSwapQuote;
    amount: number;
    amountText: string;
    pair: string;
    slippage: number;
  } | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<{
    kind: "noRoute" | "precision" | "failed";
    key: string;
  } | null>(null);
  const [picker, setPicker] = useState<Side | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [flips, setFlips] = useState(0);
  const [status, setStatus] = useState<Status>("idle");

  const payTriggerRef = useRef<HTMLButtonElement>(null);
  const receiveTriggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const slippageInputRef = useRef<HTMLInputElement>(null);
  const pendingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelTimers = () => {
    if (pendingTimer.current) {
      clearTimeout(pendingTimer.current);
      pendingTimer.current = null;
    }
    if (successTimer.current) {
      clearTimeout(successTimer.current);
      successTimer.current = null;
    }
  };

  useEffect(() => {
    return () => cancelTimers();
  }, []);

  useEffect(() => {
    if (!picker) return;
    const frame = requestAnimationFrame(() => searchRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [picker]);

  // live quote effect (only when getQuote is provided and mode is "market")
  useEffect(() => {
    if (!getQuote || mode !== "market") {
      return;
    }
    let cancelled = false;
    let inFlight: AbortController | null = null;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const typed = (Number.parseFloat(amount) || 0) > 0;
    const requestAmount = typed ? Number.parseFloat(amount) : 1;
    const amountText = typed ? amount : "1";

    const doFetch = (background: boolean) => {
      // A refresh never cancels a request that is still running.
      if (cancelled || inFlight) return;
      const c = new AbortController();
      inFlight = c;
      let timedOut = false;
      const deadline = setTimeout(() => {
        timedOut = true;
        if (inFlight === c) inFlight = null;
        if (!cancelled) {
          setQuoteError({
            kind: "failed",
            key: `${pair}|${amountText}|${slippage}`,
          });
          setQuoteLoading(false);
        }
        c.abort();
      }, QUOTE_TIMEOUT_MS);
      if (!background) setQuoteLoading(true);
      // Promise.resolve().then also routes a synchronous throw to .catch.
      Promise.resolve()
        .then(() =>
          getQuote({
            pay: latestTokens.current.pay,
            receive: latestTokens.current.receive,
            amount: requestAmount,
            amountText,
            slippage,
            signal: c.signal,
          }),
        )
        .then((q) => {
          if (cancelled || timedOut || c.signal.aborted) return;
          setLiveQuote({
            quote: q,
            amount: requestAmount,
            amountText,
            pair,
            slippage,
          });
          setQuoteError(null);
          setQuoteLoading(false);
        })
        .catch((err) => {
          if (cancelled || timedOut || c.signal.aborted) return;
          const name = err instanceof Error ? err.name : "";
          const kind =
            name === "NoRouteError"
              ? "noRoute"
              : name === "PrecisionError"
                ? "precision"
                : null;
          setQuoteError({
            kind: kind ?? "failed",
            key: `${pair}|${amountText}|${slippage}`,
          });
          setQuoteLoading(false);
          console.debug("SnapSwap quote failed", err);
        })
        .finally(() => {
          clearTimeout(deadline);
          if (inFlight === c) inFlight = null;
        });
    };

    debounceTimer = setTimeout(() => {
      doFetch(false);
      intervalId = setInterval(() => {
        if (
          typeof document !== "undefined" &&
          document.visibilityState === "visible"
        ) {
          doFetch(true);
        }
      }, 15000);
    }, 400);

    return () => {
      cancelled = true;
      if (debounceTimer) clearTimeout(debounceTimer);
      if (intervalId) clearInterval(intervalId);
      inFlight?.abort();
      setQuoteLoading(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getQuote, mode, pay.symbol, receive.symbol, amount, slippage]);

  const amountIn = Number.parseFloat(amount) || 0;
  const hasAmount = amountIn > 0;
  const marketRate =
    pay.price > 0 && receive.price > 0 ? pay.price / receive.price : 0;
  const parsedLimit = Number.parseFloat(limitInput ?? "");
  const targetPrice = limitInput === null ? marketRate : parsedLimit;
  const invalidLimit =
    mode === "limit" &&
    limitInput !== null &&
    !(Number.isFinite(parsedLimit) && parsedLimit > 0);

  // A live quote only counts for the request it answered: same pair and
  // slippage (and, for amounts, the same amount). It stays live through a
  // background refresh because those inputs do not change.
  const requestText = hasAmount ? amount : "1";
  const requestKey = `${pair}|${requestText}|${slippage}`;
  const failedHere =
    !!getQuote && mode === "market" && quoteError?.key === requestKey;
  const live =
    !!getQuote &&
    mode === "market" &&
    !failedHere &&
    !!liveQuote &&
    liveQuote.pair === pair &&
    liveQuote.slippage === slippage;
  const quoteFresh =
    live && !!liveQuote && liveQuote.amountText === requestText;
  const amountsMatch = quoteFresh && hasAmount;
  const activeError =
    failedHere && quoteError && quoteError.kind !== "failed"
      ? quoteError.kind
      : null;
  const awaitingLive =
    !!getQuote && mode === "market" && !failedHere && !quoteFresh;
  const hops =
    quoteFresh && liveQuote
      ? liveQuote.quote.hops
      : awaitingLive
        ? []
        : demoHops(pay.symbol, receive.symbol);
  const awaitingQuote = awaitingLive && hasAmount;
  const liveRate =
    live && liveQuote ? liveQuote.quote.amountOut / liveQuote.amount : null;

  const rate =
    mode === "limit"
      ? targetPrice
      : live && liveRate !== null
        ? liveRate
        : marketRate;

  const amountOut = (() => {
    if (!hasAmount || !Number.isFinite(rate) || rate <= 0) return 0;
    if (mode === "limit") return amountIn * rate * (1 - FEE);
    if (live && amountsMatch && liveQuote) return liveQuote.quote.amountOut;
    if (live) return amountIn * rate;
    return amountIn * rate * (1 - FEE);
  })();

  const usdIn = amountIn * pay.price;
  const priceImpact =
    live && amountsMatch && liveQuote
      ? liveQuote.quote.priceImpact
      : usdIn > 0
        ? (usdIn / (usdIn + DEPTH_USD)) * 100
        : 0;
  const minReceived =
    live && amountsMatch && liveQuote
      ? liveQuote.quote.minReceived
      : amountOut * (1 - slippage / 100);
  // A live source is set up but has not answered this pair yet: show a
  // neutral route instead of flashing the estimate before the real one.
  const routeGroups: { from: string; to: string; hops: SnapSwapHop[] }[] = [];
  for (const h of hops) {
    const last = routeGroups[routeGroups.length - 1];
    if (last && last.from === h.from && last.to === h.to) last.hops.push(h);
    else routeGroups.push({ from: h.from, to: h.to, hops: [h] });
  }
  // Sequential when every leg starts where the previous one ended;
  // otherwise the route splits into parallel branches.
  const sequential = routeGroups.every(
    (g, i) => i === 0 || g.from === routeGroups[i - 1].to,
  );
  const split = !sequential || routeGroups.some((g) => g.hops.length > 1);
  const insufficient = pay.balance !== undefined && amountIn > pay.balance;
  const outDecimals = receive.decimals ?? 6;
  const quoteReady =
    pay !== FALLBACK_TOKEN &&
    receive !== FALLBACK_TOKEN &&
    pay.symbol !== receive.symbol &&
    Number.isFinite(amountOut) &&
    amountOut > 0;

  const disabled =
    !hasAmount ||
    insufficient ||
    status === "pending" ||
    status === "success" ||
    !quoteReady ||
    invalidLimit ||
    activeError !== null ||
    awaitingQuote;

  // No wallet is connected, so the action is a simulation and says so.
  const label =
    status === "pending"
      ? mode === "limit"
        ? "Placing order…"
        : "Swapping…"
      : status === "success"
        ? mode === "limit"
          ? "Order simulated"
          : "Swap simulated"
        : !hasAmount
          ? "Enter an amount"
          : insufficient
            ? `Insufficient ${pay.symbol}`
            : invalidLimit
              ? "Enter a limit price"
              : activeError === "noRoute"
                ? "No route found"
                : activeError === "precision"
                  ? "Too many decimals"
                  : !quoteReady
                    ? "Enter an amount"
                    : awaitingQuote
                      ? "Fetching quote…"
                      : mode === "limit"
                        ? `Place limit order · ${expiry}`
                        : "Swap";

  const receiveAmountText = formatAmount(amountOut, outDecimals);
  const vsMarket =
    marketRate > 0 && Number.isFinite(targetPrice)
      ? ((targetPrice - marketRate) / marketRate) * 100
      : 0;

  // handlers
  const openPicker = (side: Side) => {
    setSearchQuery("");
    setPicker(side);
  };

  const closePicker = () => {
    const trigger =
      picker === "pay" ? payTriggerRef.current : receiveTriggerRef.current;
    setPicker(null);
    requestAnimationFrame(() => trigger?.focus());
  };

  const selectToken = (next: SnapSwapToken) => {
    if (picker === "pay") {
      if (next.symbol === receive.symbol) {
        setPaySymbol(receive.symbol);
        setReceiveSymbol(pay.symbol);
      } else {
        setPaySymbol(next.symbol);
      }
    } else if (picker === "receive") {
      if (next.symbol === pay.symbol) {
        setReceiveSymbol(pay.symbol);
        setPaySymbol(receive.symbol);
      } else {
        setReceiveSymbol(next.symbol);
      }
    }
    setLimitInput(null);
    cancelTimers();
    setStatus("idle");
    if (status === "success") setAmount("");
    closePicker();
  };

  const flip = () => {
    cancelTimers();
    setPaySymbol(receive.symbol);
    setReceiveSymbol(pay.symbol);
    setLimitInput(null);
    setStatus("idle");
    if (status === "success") setAmount("");
    setFlips((c) => c + 1);
  };

  const setPayAmount = (value: string) => {
    cancelTimers();
    setAmount(value);
    if (status !== "pending") setStatus("idle");
  };

  const fillBalance = (fraction: number) => {
    if (pay.balance === undefined) return;
    if (fraction < 1) {
      const d = pay.decimals ?? 6;
      const [w, f = ""] = exactNumber(pay.balance).split(".");
      const units =
        BigInt((w || "0") + f.padEnd(d, "0").slice(0, d)) / BigInt(2);
      if (units === BigInt(0)) {
        setPayAmount("");
        return;
      }
      const whole = units / BigInt(10 ** d);
      const frac = units % BigInt(10 ** d);
      const fracStr = frac.toString().padStart(d, "0").replace(/0+$/, "");
      const result = fracStr ? `${whole}.${fracStr}` : `${whole}`;
      setPayAmount(result);
    } else {
      setPayAmount(exactNumber(pay.balance));
    }
  };

  const handleMode = (next: Mode) => {
    if (status === "pending" || next === mode) return;
    cancelTimers();
    setMode(next);
    setStatus("idle");
    setLimitInput(null);
  };

  const handleSwap = () => {
    if (disabled) return;
    cancelTimers();
    setStatus("pending");
    pendingTimer.current = setTimeout(() => {
      setStatus("success");
      successTimer.current = setTimeout(() => {
        setAmount("");
        setStatus("idle");
        successTimer.current = null;
      }, 1600);
      pendingTimer.current = null;
    }, 1400);
  };

  const trapPickerFocus = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return;
    const focusables = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        "button:not([disabled]), input:not([disabled])",
      ),
    );
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const query = searchQuery.trim().toLowerCase();
  const filtered = query
    ? tokens.filter(
        (t) =>
          t.symbol.toLowerCase().includes(query) ||
          t.name.toLowerCase().includes(query),
      )
    : tokens;
  const currentPickerToken = picker === "pay" ? pay : receive;

  const colorVars = {
    "--ss-order": colors?.order ?? DEFAULT_COLORS.order,
    "--ss-slippage": colors?.slippage ?? DEFAULT_COLORS.slippage,
    "--ss-pay": colors?.pay ?? DEFAULT_COLORS.pay,
    "--ss-receive": colors?.receive ?? DEFAULT_COLORS.receive,
    "--ss-details": colors?.details ?? DEFAULT_COLORS.details,
    "--ss-action": colors?.action ?? DEFAULT_COLORS.action,
    "--ss-frame": "var(--background)",
  } as React.CSSProperties;

  const FOCUS =
    "outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950";

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        variants={INTRO}
        initial={intro ? "hidden" : false}
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        className={cn(
          "relative flex w-full max-w-[400px] flex-col gap-0.5 rounded-[16px] bg-[var(--ss-frame)] p-0.5",
          className,
        )}
        style={colorVars}
      >
        {/* Top row */}
        <div className="relative z-40 grid grid-cols-2 gap-0.5">
          {/* Order */}
          <motion.div
            variants={PIECE_LEFT}
            className="relative z-[1] rounded-[14px] rounded-br-none p-3 pr-5 text-neutral-950 dark:brightness-[0.88]"
            style={{ backgroundColor: "var(--ss-order)" }}
          >
            <p
              id={`${uid}-order`}
              className="text-[13px] font-medium opacity-85"
            >
              Order
            </p>
            <div
              role="radiogroup"
              aria-labelledby={`${uid}-order`}
              onKeyDown={(event) => {
                const keys = [
                  "ArrowLeft",
                  "ArrowRight",
                  "ArrowUp",
                  "ArrowDown",
                ];
                if (!keys.includes(event.key)) return;
                event.preventDefault();
                const next = mode === "market" ? "limit" : "market";
                handleMode(next);
                event.currentTarget
                  .querySelector<HTMLButtonElement>(`[data-mode="${next}"]`)
                  ?.focus();
              }}
              className="relative mt-2 flex items-center gap-0.5 rounded-full bg-neutral-950/10 p-1"
            >
              {(["market", "limit"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  role="radio"
                  data-mode={item}
                  aria-checked={mode === item}
                  tabIndex={mode === item ? 0 : -1}
                  aria-label={
                    item === "market" ? "Market order" : "Limit order"
                  }
                  disabled={status === "pending"}
                  onClick={() => handleMode(item)}
                  className={cn(
                    "relative flex-1 rounded-full px-3 py-1 text-[13px] font-medium transition-[scale,background-color,color] duration-100 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
                    FOCUS,
                  )}
                >
                  {mode === item && (
                    <motion.span
                      layoutId={`ss-tab-${uid}`}
                      transition={SPRING}
                      className="absolute inset-0 rounded-full bg-neutral-950"
                    />
                  )}
                  <span
                    className={cn(
                      "relative",
                      mode === item ? "text-white" : "text-neutral-950/75",
                    )}
                  >
                    {item === "market" ? "Market" : "Limit"}
                  </span>
                </button>
              ))}
            </div>
            <PuzzleTab color="var(--ss-order)" at="38%" size={70} />
          </motion.div>

          {/* Slippage */}
          <motion.div
            variants={PIECE_RIGHT}
            className="relative z-[2] rounded-[14px] rounded-bl-none p-3 text-neutral-950 dark:brightness-[0.88]"
            style={{ backgroundColor: "var(--ss-slippage)" }}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-[13px] font-medium opacity-85">Slippage</p>
              <span className="text-[13px] font-semibold whitespace-nowrap tabular-nums">
                {slippage}%
              </span>
            </div>
            <div className="mt-2 flex items-center gap-0.5">
              <button
                type="button"
                aria-pressed={slippageMode === "auto"}
                onClick={() => {
                  setSlippageMode("auto");
                  setSlippage(0.5);
                }}
                className={cn(
                  "relative rounded-full px-1.5 py-0.5 text-[13px] font-medium transition-[scale,background-color,color] duration-100 ease-out active:scale-[0.97]",
                  FOCUS,
                  slippageMode === "auto"
                    ? "text-white"
                    : "text-neutral-950/85",
                )}
              >
                {slippageMode === "auto" && (
                  <motion.span
                    layoutId={`ss-slip-${uid}`}
                    transition={SPRING}
                    className="absolute inset-0 rounded-full bg-neutral-950"
                  />
                )}
                <span className="relative">Auto</span>
              </button>
              {SLIPPAGE_PRESETS.map((preset) => {
                const active = slippageMode === "preset" && slippage === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      setSlippageMode("preset");
                      setSlippage(preset);
                    }}
                    className={cn(
                      "relative rounded-full px-1.5 py-0.5 text-[13px] font-medium transition-[scale,background-color,color] duration-100 ease-out active:scale-[0.97]",
                      FOCUS,
                      active ? "text-white" : "text-neutral-950/85",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId={`ss-slip-${uid}`}
                        transition={SPRING}
                        className="absolute inset-0 rounded-full bg-neutral-950"
                      />
                    )}
                    <span className="relative">{preset}</span>
                  </button>
                );
              })}
              {slippageMode === "custom" ? (
                <span className="relative inline-flex items-center rounded-full px-1.5 py-0.5 text-[13px] font-medium">
                  <motion.span
                    layoutId={`ss-slip-${uid}`}
                    transition={SPRING}
                    className="absolute inset-0 rounded-full bg-neutral-950"
                  />
                  <input
                    ref={slippageInputRef}
                    value={customSlippage}
                    onChange={(e) => {
                      const raw = parseDecimalInput(e.target.value);
                      if (raw === null) return;
                      setCustomSlippage(raw);
                      const next = Number.parseFloat(raw);
                      if (Number.isFinite(next) && next > 0) {
                        setSlippage(
                          Math.round(Math.min(50, Math.max(0.01, next)) * 100) /
                            100,
                        );
                      }
                    }}
                    onBlur={() => setCustomSlippage(String(slippage))}
                    inputMode="decimal"
                    aria-label="Custom slippage percent"
                    className={cn(
                      "relative w-10 bg-transparent text-center text-white tabular-nums outline-none",
                      FOCUS,
                    )}
                  />
                </span>
              ) : (
                <button
                  type="button"
                  aria-pressed={false}
                  aria-label="Custom slippage"
                  title="Custom slippage"
                  onClick={() => {
                    setSlippageMode("custom");
                    setCustomSlippage(String(slippage));
                    requestAnimationFrame(() =>
                      slippageInputRef.current?.select(),
                    );
                  }}
                  className={cn(
                    "relative grid size-6 place-items-center rounded-full text-neutral-950/85 transition-[scale,background-color,color] duration-100 ease-out hover:bg-neutral-950/10 active:scale-[0.97]",
                    FOCUS,
                  )}
                >
                  <Pencil className="size-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
            <PuzzleTab
              color="var(--ss-slippage)"
              side="left"
              at="22px"
              size={20}
            />
          </motion.div>
        </div>

        {/* Pay + Receive */}
        <div className="relative flex flex-col gap-0.5">
          {/* Pay block */}
          <motion.div
            variants={PIECE}
            className="relative z-30 rounded-[14px] p-3.5 pt-4 text-neutral-950 dark:brightness-[0.88]"
            style={{ backgroundColor: "var(--ss-pay)" }}
          >
            {/* Balance and Half/Max sit up top, clear of the flip button. */}
            <div className="flex items-center justify-between gap-2">
              <p className="text-[13px] font-medium opacity-85">You pay</p>
              {pay.balance !== undefined && (
                <div className="flex shrink-0 items-center gap-1.5 text-[14px] text-neutral-950/80">
                  <span className="flex items-center gap-1 whitespace-nowrap tabular-nums">
                    <Wallet className="size-3.5" aria-hidden="true" />
                    <span className="sr-only">Balance</span>
                    {formatAmount(pay.balance, pay.decimals ?? 4)}
                  </span>
                  <button
                    type="button"
                    onClick={() => fillBalance(0.5)}
                    disabled={status === "pending"}
                    className={cn(
                      "rounded-full bg-neutral-950/10 px-2 py-0.5 text-[13px] font-medium transition-[scale,background-color,color] duration-100 ease-out hover:bg-neutral-950/15 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
                      FOCUS,
                    )}
                  >
                    Half
                  </button>
                  <button
                    type="button"
                    onClick={() => fillBalance(1)}
                    disabled={status === "pending"}
                    className={cn(
                      "rounded-full bg-neutral-950/10 px-2 py-0.5 text-[13px] font-medium transition-[scale,background-color,color] duration-100 ease-out hover:bg-neutral-950/15 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
                      FOCUS,
                    )}
                  >
                    Max
                  </button>
                </div>
              )}
            </div>
            <div className="mt-2 flex items-center gap-3">
              <input
                value={amount}
                onChange={(e) => {
                  const next = parseDecimalInput(e.target.value);
                  if (next !== null) setPayAmount(next);
                }}
                readOnly={status === "pending"}
                inputMode="decimal"
                autoComplete="off"
                placeholder="0"
                aria-label={`${pay.symbol} amount to pay`}
                className={cn(
                  "block min-w-0 flex-1 bg-transparent text-left leading-none font-semibold tracking-tighter tabular-nums outline-none placeholder:opacity-40",
                  amountTextSize(amount || "0"),
                  "transition-[font-size] duration-200 ease-out",
                  insufficient && "text-red-700",
                )}
              />
              <button
                ref={payTriggerRef}
                type="button"
                onClick={() => openPicker("pay")}
                disabled={status === "pending"}
                aria-haspopup="dialog"
                aria-label={`Change pay token, currently ${pay.symbol}`}
                className={cn(
                  "flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-neutral-950/10 px-2.5 text-sm font-semibold transition-[scale,background-color,color] duration-100 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
                  FOCUS,
                )}
              >
                <TokenLogo token={pay} className="size-5" />
                <span>{pay.symbol}</span>
                <ChevronDown className="size-3.5 opacity-60" />
              </button>
            </div>
            <div className="mt-1.5 flex justify-end text-[14px] text-neutral-950/80">
              <div className="truncate tabular-nums">{formatUsd(usdIn)}</div>
            </div>
            {/* Flip button, centred on the seam below the Pay block */}
            <motion.button
              type="button"
              onClick={flip}
              disabled={status === "pending"}
              variants={FLIP_PIECE}
              whileTap={status === "pending" ? undefined : { scale: 0.97 }}
              aria-label="Switch pay and receive tokens"
              className={cn(
                "absolute bottom-0 left-1/2 z-40 mb-[-1px] grid size-11 -translate-x-1/2 translate-y-1/2 place-items-center rounded-[12px] bg-neutral-950 text-white ring-2 ring-[var(--ss-frame)] transition-colors duration-100 ease-out hover:bg-neutral-800 disabled:pointer-events-none disabled:opacity-50",
                FOCUS,
              )}
            >
              <motion.span
                animate={{ rotate: flips * 180 }}
                transition={FLIP_SPRING}
                className="grid place-items-center"
              >
                <ArrowDownUp className="size-5" />
              </motion.span>
            </motion.button>
          </motion.div>

          {/* Receive block */}
          <motion.div
            variants={PIECE}
            className="relative z-20 rounded-[14px] p-3.5 text-neutral-950 dark:brightness-[0.88]"
            style={{ backgroundColor: "var(--ss-receive)" }}
          >
            <p className="text-[13px] font-medium opacity-85">You receive</p>

            <div className="mt-2 flex items-center gap-3">
              <p
                className={cn(
                  "min-w-0 flex-1 text-left leading-none font-semibold tracking-tighter tabular-nums transition-opacity duration-150",
                  amountTextSize(receiveAmountText),
                  "transition-[font-size] duration-200 ease-out",
                  quoteLoading
                    ? "opacity-60"
                    : !hasAmount || amountOut === 0
                      ? "opacity-40"
                      : "",
                )}
              >
                <RollingNumber value={receiveAmountText} />
              </p>
              <button
                ref={receiveTriggerRef}
                type="button"
                onClick={() => openPicker("receive")}
                disabled={status === "pending"}
                aria-haspopup="dialog"
                aria-label={`Change receive token, currently ${receive.symbol}`}
                className={cn(
                  "flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-neutral-950/10 px-2.5 text-sm font-semibold transition-[scale,background-color,color] duration-100 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
                  FOCUS,
                )}
              >
                <TokenLogo token={receive} className="size-5" />
                <span>{receive.symbol}</span>
                <ChevronDown className="size-3.5 opacity-60" />
              </button>
            </div>
            <div className="mt-1.5 flex items-center justify-between gap-3 text-[14px] text-neutral-950/80">
              <span />
              <div className="truncate tabular-nums">
                <RollingNumber value={formatUsd(amountOut * receive.price)} />
              </div>
            </div>

            <AnimatePresence>
              {mode === "limit" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={SPRING}
                  className="mt-2 overflow-hidden"
                >
                  <div className="flex items-center gap-2 rounded-full bg-neutral-950/10 px-3 py-1.5 text-[13px]">
                    <span className="opacity-80">At price</span>
                    <input
                      value={limitInput ?? plainNumber(marketRate)}
                      onChange={(e) => {
                        const next = parseDecimalInput(e.target.value);
                        if (next !== null) setLimitInput(next);
                      }}
                      readOnly={status === "pending"}
                      inputMode="decimal"
                      aria-label={`Limit price in ${receive.symbol} per ${pay.symbol}`}
                      className="min-w-0 flex-1 bg-transparent text-right font-semibold tabular-nums outline-none"
                    />
                    <span className="opacity-80">{receive.symbol}</span>
                    <span
                      className={cn(
                        "font-medium tabular-nums",
                        vsMarket > 0
                          ? "text-emerald-900"
                          : vsMarket < 0
                            ? "text-red-900"
                            : "opacity-70",
                      )}
                    >
                      {vsMarket >= 0 ? "+" : ""}
                      {vsMarket.toFixed(2)}%
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2 text-[13px]">
                    <span className="opacity-80">Expires</span>
                    <div className="flex gap-1">
                      {EXPIRIES.map((option) => {
                        const active = expiry === option;
                        return (
                          <button
                            key={option}
                            type="button"
                            aria-pressed={active}
                            disabled={status === "pending"}
                            onClick={() => setExpiry(option)}
                            className={cn(
                              "relative rounded-full px-2 py-0.5 text-[13px] font-medium transition-[scale,background-color,color] duration-100 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
                              FOCUS,
                              active ? "text-white" : "text-neutral-950/85",
                            )}
                          >
                            {active && (
                              <motion.span
                                layoutId={`ss-expiry-${uid}`}
                                transition={SPRING}
                                className="absolute inset-0 rounded-full bg-neutral-950"
                              />
                            )}
                            <span className="relative">{option}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <PuzzleTab color="var(--ss-receive)" at="58%" size={70} />
          </motion.div>
        </div>

        {/* Details + Action wrapper */}
        <div className="relative z-0 flex flex-col gap-0.5">
          {/* Details block */}
          <motion.div
            variants={PIECE}
            className="relative z-10 rounded-[14px] p-4 pt-5 text-neutral-950 dark:brightness-[0.88]"
            style={{ backgroundColor: "var(--ss-details)" }}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[13px] font-medium opacity-85">
                Route &amp; details
              </span>
              {quoteFresh ? (
                <span className="flex items-center gap-1 rounded-full bg-neutral-950 px-2 py-0.5 text-[11px] font-medium text-white">
                  <span className="size-1.5 rounded-full bg-emerald-400 motion-safe:animate-pulse" />
                  {quoteSource ? `Live · ${quoteSource}` : "Live"}
                </span>
              ) : getQuote &&
                (quoteLoading || awaitingLive) &&
                mode === "market" ? (
                <span className="rounded-full bg-neutral-950/10 px-2 py-0.5 text-[11px] font-medium">
                  Updating…
                </span>
              ) : (
                <span
                  title="Local estimate, not a live quote"
                  className="rounded-full bg-neutral-950/10 px-2 py-0.5 text-[11px] font-medium"
                >
                  Estimate
                </span>
              )}
            </div>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={hops.map((h) => `${h.from}-${h.to}-${h.venue}`).join(",")}
                initial={{ opacity: 0, y: 4, filter: "blur(2px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -4, filter: "blur(2px)" }}
                transition={SPRING}
                className="mt-3 flex min-w-0 flex-col gap-1.5"
              >
                {(() => {
                  const renderLogo = (symbol: string) => {
                    const t = tokens.find((x) => x.symbol === symbol);
                    if (t) {
                      return (
                        <TokenLogo
                          token={t}
                          className="size-5 shrink-0 ring-2 ring-[var(--ss-details)]"
                        />
                      );
                    }
                    return (
                      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-neutral-950/10 text-[9px] font-semibold text-neutral-950">
                        {symbol.slice(0, 4)}
                      </span>
                    );
                  };

                  const renderPill = (g: (typeof routeGroups)[number]) => {
                    const text = g.hops
                      .map((h) =>
                        h.share === 100 ? h.venue : `${h.venue} ${h.share}%`,
                      )
                      .join(" · ");
                    return (
                      <span
                        title={text}
                        className="max-w-[104px] truncate rounded-full bg-neutral-950/10 px-2 py-0.5 text-[12px] font-medium"
                      >
                        {text}
                      </span>
                    );
                  };

                  const connector = (
                    <span className="h-px min-w-1 flex-1 bg-neutral-950/25" />
                  );

                  // Parallel branches: one row per leg, each with its own ends.
                  if (!sequential) {
                    const shown = routeGroups.slice(0, 3);
                    return (
                      <>
                        {shown.map((g, i) => (
                          <div
                            key={i}
                            className="flex min-w-0 items-center gap-1"
                          >
                            {renderLogo(g.from)}
                            {connector}
                            {renderPill(g)}
                            {connector}
                            {renderLogo(g.to)}
                          </div>
                        ))}
                        {routeGroups.length > shown.length && (
                          <p className="text-[12px] font-medium opacity-80">
                            +{routeGroups.length - shown.length} more legs
                          </p>
                        )}
                      </>
                    );
                  }

                  const elements: React.ReactNode[] = [];
                  if (routeGroups.length === 0) {
                    elements.push(renderLogo(pay.symbol));
                    elements.push(connector);
                    elements.push(renderLogo(receive.symbol));
                  } else if (routeGroups.length > 3) {
                    const first = routeGroups[0];
                    const last = routeGroups[routeGroups.length - 1];
                    elements.push(renderLogo(first.from), connector);
                    elements.push(renderPill(first), connector);
                    elements.push(renderLogo(first.to), connector);
                    elements.push(
                      <span className="rounded-full bg-neutral-950/10 px-2 py-0.5 text-[12px] font-medium">
                        +{routeGroups.length - 2}
                      </span>,
                      connector,
                    );
                    elements.push(renderPill(last), connector);
                    elements.push(renderLogo(last.to));
                  } else {
                    elements.push(renderLogo(routeGroups[0].from));
                    routeGroups.forEach((g) => {
                      elements.push(connector, renderPill(g), connector);
                      elements.push(renderLogo(g.to));
                    });
                  }
                  return (
                    <div className="flex min-w-0 items-center gap-1">
                      {elements.map((el, i) => (
                        <Fragment key={i}>{el}</Fragment>
                      ))}
                    </div>
                  );
                })()}
                <span className="sr-only">
                  {hops.length === 0
                    ? "Loading route"
                    : `${quoteFresh ? "Live route" : "Estimated route"}: ${hops
                        .map((h) =>
                          h.share === 100
                            ? `${h.from} to ${h.to} through ${h.venue}`
                            : `${h.from} to ${h.to} through ${h.venue} ${h.share}%`,
                        )
                        .join(", ")}`}
                </span>
              </motion.div>
            </AnimatePresence>
            <p className="mt-2 text-[13px] font-medium tabular-nums opacity-85">
              1 {pay.symbol} = {compactNumber(rate) ?? formatAmount(rate, 6)}{" "}
              {receive.symbol}
            </p>
            {/* Stats only mean something once there is an amount. */}
            <AnimatePresence initial={false}>
              {hasAmount && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={SPRING}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-3 gap-2 pt-3">
                    <div className="min-w-0">
                      <p className="text-[12px] opacity-80">Price impact</p>
                      <p className="truncate text-[22px] leading-none font-semibold tabular-nums">
                        {priceImpact > 0 && priceImpact < 0.01
                          ? "<0.01%"
                          : `${priceImpact.toFixed(2)}%`}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] opacity-80">
                        {split ? "Route" : "Hops"}
                      </p>
                      <p className="truncate text-[22px] leading-none font-semibold tabular-nums">
                        {routeGroups.length === 0
                          ? "–"
                          : split
                            ? "Split"
                            : routeGroups.length === 1
                              ? "Direct"
                              : `${routeGroups.length} hops`}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] opacity-80">Min received</p>
                      <p className="truncate text-[22px] leading-none font-semibold tabular-nums">
                        {compactNumber(minReceived, true) ??
                          formatAmount(minReceived, outDecimals, true)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <PuzzleTab color="var(--ss-details)" at="38%" size={70} />
          </motion.div>

          <span className="sr-only" aria-live="polite">
            {status === "idle" ? "" : label}
          </span>

          {/* Action block */}
          <motion.button
            type="button"
            onClick={handleSwap}
            disabled={disabled}
            variants={PIECE}
            whileTap={disabled ? undefined : { scale: 0.97 }}
            aria-label={label}
            className={cn(
              "relative z-0 flex h-14 w-full items-center justify-center rounded-[14px] text-base font-semibold transition-[scale,background-color,color] duration-100 ease-out disabled:cursor-not-allowed",
              disabled
                ? "text-neutral-950/50 dark:brightness-[0.88]"
                : // Inverts on dark pages so the button keeps its edges.
                  "bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200",
              FOCUS,
            )}
            style={
              disabled ? { backgroundColor: "var(--ss-action)" } : undefined
            }
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={label}
                initial={{ opacity: 0, y: 8, filter: "blur(3px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(3px)" }}
                transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              >
                {label}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Token sheet */}
        <AnimatePresence>
          {picker && (
            <motion.div
              key="token-picker"
              role="dialog"
              aria-modal="true"
              aria-label="Select a token"
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.stopPropagation();
                  closePicker();
                  return;
                }
                trapPickerFocus(event);
              }}
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={SHEET_SPRING}
              className="absolute inset-0 z-50 flex flex-col overflow-hidden rounded-[14px] bg-neutral-950 text-white"
            >
              <div className="flex items-center justify-between gap-2 px-4 pt-4">
                <h3 className="text-base font-semibold tracking-tight">
                  Select a token
                </h3>
                <button
                  type="button"
                  onClick={closePicker}
                  aria-label="Close token picker"
                  className={cn(
                    "grid size-8 place-items-center rounded-full text-white/70 transition-[scale,background-color,color] duration-100 ease-out hover:bg-white/10 hover:text-white active:scale-[0.97]",
                    FOCUS,
                  )}
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="relative mt-3 px-4">
                <Search
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 left-7 size-4 -translate-y-1/2 text-white/50"
                />
                <input
                  ref={searchRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name or symbol"
                  aria-label="Search tokens"
                  autoComplete="off"
                  className="h-10 w-full rounded-full border border-white/10 bg-white/5 pr-3 pl-9 text-sm text-white outline-none placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-white"
                />
              </div>

              <div className="mt-3 min-h-0 flex-1 overflow-y-auto px-2 pb-3">
                {/* Plain buttons: Tab moves through the results. */}
                <div aria-label="Tokens" role="group">
                  {filtered.map((token, index) => {
                    const selected = token.symbol === currentPickerToken.symbol;
                    return (
                      <motion.button
                        key={token.symbol}
                        type="button"
                        aria-current={selected ? "true" : undefined}
                        onClick={() => selectToken(token)}
                        initial={
                          searchQuery.trim() ? false : { opacity: 0, y: 6 }
                        }
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          type: "spring",
                          bounce: 0,
                          duration: 0.3,
                          delay: Math.min(index, 8) * 0.025,
                        }}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-left transition-[scale,background-color,color] duration-100 ease-out active:scale-[0.97]",
                          selected ? "bg-white/10" : "hover:bg-white/5",
                        )}
                      >
                        <TokenLogo token={token} className="size-8" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold">
                            {token.symbol}
                          </span>
                          <span className="block truncate text-xs text-white/60">
                            {token.name}
                          </span>
                        </span>
                        <span className="shrink-0 text-right">
                          <span className="block text-sm font-medium tabular-nums">
                            {token.balance !== undefined
                              ? formatAmount(token.balance, token.decimals ?? 4)
                              : "—"}
                          </span>
                          {token.balance !== undefined && (
                            <span className="block text-[12px] text-white/70 tabular-nums">
                              {formatUsd(token.balance * token.price)}
                            </span>
                          )}
                        </span>
                      </motion.button>
                    );
                  })}
                  {filtered.length === 0 && (
                    <p className="px-3 py-8 text-center text-sm text-white/60">
                      No tokens found
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </MotionConfig>
  );
}
