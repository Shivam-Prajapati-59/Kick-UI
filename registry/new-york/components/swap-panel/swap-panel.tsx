"use client";

import {
  ArrowRight,
  ArrowUpDown,
  ChevronDown,
  Loader2,
  Search,
  Settings2,
  X,
} from "lucide-react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

export interface SwapToken {
  symbol: string;
  name: string;
  /** Token logo. Without it the symbol's first letter is shown. */
  logo?: string;
  /** USD price per token. */
  price: number;
  /** Wallet balance in tokens, when known. */
  balance?: number;
  /** Maximum fraction digits used when the token's amounts are displayed. */
  decimals?: number;
}

export interface SwapQuote {
  mode: "market" | "limit";
  pay: SwapToken;
  receive: SwapToken;
  amountIn: number;
  amountOut: number;
  minReceived: number;
  slippage: number;
  limitPrice?: number;
}

export interface SwapPanelProps {
  tokens: SwapToken[];
  /** Symbol of the token on the pay side. Defaults to the first token. */
  defaultPay?: string;
  /** Symbol of the token on the receive side. Defaults to the second token. */
  defaultReceive?: string;
  /** Liquidity fee in basis points, taken from the output. */
  feeBps?: number;
  /** USD depth used to estimate price impact. */
  depthUsd?: number;
  /** Network fee label, shown in the details. */
  networkFee?: string;
  /** Venue names for the route row. */
  route?: string[];
  /** Seconds between automatic quote refreshes. */
  refreshInterval?: number;
  onRefreshQuote?: () => void;
  onSwap?: (quote: SwapQuote) => Promise<void> | void;
  /** Any CSS background that fills the primary button. Keep it light. */
  accent?: string;
  className?: string;
}

type Side = "pay" | "receive";
type SwapMode = "market" | "limit";
type SwapStatus = "idle" | "pending" | "success" | "error";

const SPRING = { type: "spring", bounce: 0, duration: 0.32 } as const;
const FLIP_SPRING = { type: "spring", bounce: 0.2, duration: 0.45 } as const;
const SHEET_SPRING = { type: "spring", bounce: 0.15, duration: 0.35 } as const;
const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const CHIP =
  "rounded-full border border-border/60 bg-background/70 px-2 py-0.5 text-[11px] font-medium text-foreground active:scale-[0.97] transition-[transform,background-color,color] duration-100 ease-out hover:bg-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";
const TOKEN_PILL =
  "flex h-9 shrink-0 items-center gap-2 rounded-full border border-border/60 bg-card pr-2 pl-[5px] active:scale-[0.97] transition-[transform,background-color,color] duration-100 ease-out hover:bg-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none";
const SLIPPAGE_PRESETS = [0.1, 0.5, 1] as const;
const RING_RADIUS = 7.5;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;
const FALLBACK_TOKEN: SwapToken = {
  symbol: "TOKEN",
  name: "Unknown token",
  price: 0,
};

const DEFAULT_ACCENT =
  "radial-gradient(120% 140% at 18% 0%, color-mix(in oklab, var(--primary) 70%, white) 0%, transparent 60%), linear-gradient(135deg, var(--primary) 0%, color-mix(in oklab, var(--primary) 82%, white) 100%)";

const NOISE_URI = `data:image/svg+xml;utf8,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>",
)}`;

// Digits with at most one decimal point, capped so the field stays readable.
function sanitizeNumber(raw: string) {
  const [whole, ...rest] = raw.replace(/[^\d.]/g, "").split(".");
  const value = rest.length ? `${whole}.${rest.join("")}` : whole;
  return value.slice(0, 24);
}

function formatAmount(value: number, maxFractionDigits = 6) {
  if (!Number.isFinite(value) || value <= 0) return "0";
  const digits =
    maxFractionDigits === 0
      ? 0
      : value >= 1000
        ? Math.min(maxFractionDigits, 2)
        : value >= 1
          ? Math.min(maxFractionDigits, 4)
          : maxFractionDigits;
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

function impactTone(impact: number) {
  if (impact <= 0) return "text-muted-foreground";
  if (impact < 1) return "text-emerald-600 dark:text-emerald-400";
  if (impact <= 3) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function amountTextSize(value: string) {
  const len = value.length;
  if (len <= 9) return "text-4xl";
  if (len <= 12) return "text-3xl";
  return "text-2xl";
}

function TokenLogo({
  token,
  className,
}: {
  token: SwapToken;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!token.logo || failed) {
    return (
      <span
        aria-hidden
        className={cn(
          "text-muted-foreground bg-muted grid shrink-0 place-items-center rounded-full text-[11px] font-semibold",
          className,
        )}
      >
        {token.symbol.charAt(0).toUpperCase()}
      </span>
    );
  }

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={token.logo}
        alt=""
        width={24}
        height={24}
        draggable={false}
        onError={() => setFailed(true)}
        className={cn("bg-muted shrink-0 rounded-full object-cover", className)}
      />
    </>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-1 text-xs">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="min-w-0 text-right font-medium">{children}</span>
    </div>
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

export default function SwapPanel({
  tokens,
  defaultPay,
  defaultReceive,
  feeBps = 30,
  depthUsd = 2_000_000,
  networkFee = "~$0.01",
  route = ["Best route"],
  refreshInterval = 15,
  onRefreshQuote,
  onSwap,
  accent = DEFAULT_ACCENT,
  className,
}: SwapPanelProps) {
  const uid = useId();
  const detailsId = `${uid}-details`;
  const limitId = `${uid}-limit`;
  const pickerTitleId = `${uid}-picker-title`;

  const [paySymbol, setPaySymbol] = useState<string>(
    () => defaultPay ?? tokens[0]?.symbol ?? FALLBACK_TOKEN.symbol,
  );
  const [receiveSymbol, setReceiveSymbol] = useState<string>(
    () =>
      defaultReceive ??
      tokens[1]?.symbol ??
      tokens[0]?.symbol ??
      FALLBACK_TOKEN.symbol,
  );
  const pay =
    tokens.find((token) => token.symbol === paySymbol) ?? FALLBACK_TOKEN;
  const receive =
    tokens.find((token) => token.symbol === receiveSymbol) ?? FALLBACK_TOKEN;

  const [mode, setMode] = useState<SwapMode>("market");
  const [amount, setAmount] = useState("");
  const [limitInput, setLimitInput] = useState<string | null>(null);
  const [slippage, setSlippage] = useState(0.5);
  const [slippageInput, setSlippageInput] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [invertRate, setInvertRate] = useState(false);
  const [picker, setPicker] = useState<Side | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [flips, setFlips] = useState(0);
  const [status, setStatus] = useState<SwapStatus>("idle");
  const [quoteTick, setQuoteTick] = useState(0);

  const searchRef = useRef<HTMLInputElement>(null);
  const payTriggerRef = useRef<HTMLButtonElement>(null);
  const receiveTriggerRef = useRef<HTMLButtonElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelSuccessReset = () => {
    if (successTimer.current) {
      clearTimeout(successTimer.current);
      successTimer.current = null;
    }
  };
  const leaveSuccess = () => {
    cancelSuccessReset();
    if (status === "success") setAmount("");
  };

  const fee = Math.min(Math.max(feeBps, 0), 10_000) / 10_000;
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
  const rate = mode === "limit" ? targetPrice : marketRate;
  const amountOut =
    hasAmount && Number.isFinite(rate) && rate > 0
      ? amountIn * rate * (1 - fee)
      : 0;
  const usdIn = amountIn * pay.price;
  const priceImpact = usdIn > 0 ? (usdIn / (usdIn + depthUsd)) * 100 : 0;
  const minReceived = amountOut * (1 - slippage / 100);
  const insufficient = pay.balance !== undefined && amountIn > pay.balance;
  const interval = Math.max(1, refreshInterval);
  const outDecimals = receive.decimals ?? 6;

  // Escape / outside click close the settings popover and restore its trigger.
  useEffect(() => {
    if (!settingsOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!settingsRef.current?.contains(event.target as Node)) {
        setSettingsOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setSettingsOpen(false);
      settingsButtonRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [settingsOpen]);

  // Focus the picker's search field when it opens.
  useEffect(() => {
    if (!picker) return;
    const frame = requestAnimationFrame(() => searchRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [picker]);

  useEffect(
    () => () => {
      if (successTimer.current) clearTimeout(successTimer.current);
    },
    [],
  );

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

  const selectToken = (next: SwapToken) => {
    if (picker === "pay") {
      if (next.symbol === receiveSymbol) {
        setPaySymbol(receiveSymbol);
        setReceiveSymbol(paySymbol);
      } else {
        setPaySymbol(next.symbol);
      }
    } else if (picker === "receive") {
      if (next.symbol === paySymbol) {
        setReceiveSymbol(paySymbol);
        setPaySymbol(receiveSymbol);
      } else {
        setReceiveSymbol(next.symbol);
      }
    }
    setLimitInput(null);
    leaveSuccess();
    setStatus("idle");
    closePicker();
  };

  const flip = () => {
    setPaySymbol(receiveSymbol);
    setReceiveSymbol(paySymbol);
    setLimitInput(null);
    leaveSuccess();
    setStatus("idle");
    setFlips((count) => count + 1);
  };

  const applyCustomSlippage = () => {
    const value = Number.parseFloat(slippageInput);
    if (Number.isFinite(value) && value > 0 && value <= 50) {
      setSlippage(value);
    } else {
      setSlippageInput(
        (SLIPPAGE_PRESETS as readonly number[]).includes(slippage)
          ? ""
          : String(slippage),
      );
    }
  };

  const refreshQuote = () => {
    setQuoteTick((tick) => tick + 1);
    onRefreshQuote?.();
  };

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
    invalidLimit;
  const label =
    status === "pending"
      ? "Swapping…"
      : status === "success"
        ? "Swapped"
        : status === "error"
          ? "Try again"
          : !hasAmount
            ? "Enter an amount"
            : insufficient
              ? `Insufficient ${pay.symbol} balance`
              : invalidLimit
                ? "Enter a limit price"
                : !quoteReady
                  ? "No quote available"
                  : mode === "limit"
                    ? "Place limit order"
                    : "Swap";

  const handleSwap = async () => {
    if (disabled) return;
    cancelSuccessReset();
    setStatus("pending");
    const quote: SwapQuote = {
      mode,
      pay,
      receive,
      amountIn,
      amountOut,
      minReceived,
      slippage,
      ...(mode === "limit" ? { limitPrice: targetPrice } : {}),
    };
    try {
      await onSwap?.(quote);
      setStatus("success");
      if (successTimer.current) clearTimeout(successTimer.current);
      successTimer.current = setTimeout(() => {
        setAmount("");
        setStatus("idle");
      }, 1600);
    } catch {
      setStatus("error");
    }
  };

  const rateLabel = invertRate ? receive.symbol : pay.symbol;
  const rateValue = invertRate ? (rate > 0 ? 1 / rate : 0) : rate;
  const query = searchQuery.trim().toLowerCase();
  const filtered = query
    ? tokens.filter(
        (token) =>
          token.symbol.toLowerCase().includes(query) ||
          token.name.toLowerCase().includes(query),
      )
    : tokens;
  const currentPickerToken = picker === "pay" ? pay : receive;

  const setPayAmount = (value: string) => {
    setAmount(value);
    cancelSuccessReset();
    if (status !== "pending" && (status === "success" || status === "error")) {
      setStatus("idle");
    }
  };

  const fillBalance = (fraction: number) => {
    if (pay.balance === undefined) return;
    setPayAmount(exactNumber(pay.balance * fraction));
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

  const receiveAmountText = formatAmount(amountOut, outDecimals);

  return (
    <MotionConfig reducedMotion="user">
      <section
        aria-label="Token swap"
        className={cn(
          "bg-card text-card-foreground border-border/70 relative isolate w-full max-w-[420px] rounded-[28px] border p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_10px_24px_-12px_rgba(0,0,0,0.12),0_32px_60px_-24px_rgba(0,0,0,0.16)] max-[400px]:rounded-[24px] max-[400px]:p-3.5 dark:ring-1 dark:ring-white/10",
          className,
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div
            role="tablist"
            aria-label="Order type"
            className="bg-muted/60 relative flex items-center gap-0.5 rounded-full p-1"
          >
            {(["market", "limit"] as const).map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={mode === item}
                disabled={status === "pending"}
                onClick={() => {
                  if (status === "pending") return;
                  leaveSuccess();
                  setMode(item);
                  setStatus("idle");
                }}
                className={cn(
                  "relative rounded-full px-4 py-1.5 text-[13px] font-medium transition-[transform,background-color,color] duration-100 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
                  FOCUS,
                )}
              >
                {mode === item && (
                  <motion.span
                    layoutId={`sp-tab-${uid}`}
                    transition={SPRING}
                    className="border-border/70 bg-card dark:bg-muted absolute inset-0 rounded-full border"
                  />
                )}
                <span
                  className={cn(
                    "relative",
                    mode === item
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item === "market" ? "Market" : "Limit"}
                </span>
              </button>
            ))}
          </div>

          <div ref={settingsRef} className="relative">
            <button
              ref={settingsButtonRef}
              type="button"
              onClick={() => setSettingsOpen((open) => !open)}
              aria-label="Swap settings"
              aria-haspopup="dialog"
              aria-expanded={settingsOpen}
              className={cn(
                "text-muted-foreground hover:bg-muted hover:text-foreground grid size-9 place-items-center rounded-full transition-[transform,background-color,color] duration-100 ease-out active:scale-[0.97]",
                FOCUS,
              )}
            >
              <Settings2 className="size-4" />
            </button>

            <AnimatePresence>
              {settingsOpen && (
                <motion.div
                  role="dialog"
                  aria-label="Swap settings"
                  initial={{
                    opacity: 0,
                    scale: 0.92,
                    y: -6,
                    filter: "blur(6px)",
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    filter: "blur(0px)",
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.92,
                    y: -6,
                    filter: "blur(6px)",
                  }}
                  transition={{
                    type: "spring",
                    bounce: 0,
                    duration: 0.28,
                  }}
                  className="border-border bg-card absolute top-full right-0 z-20 mt-2 w-64 origin-top-right rounded-2xl border p-4 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.25)]"
                >
                  <p className="text-muted-foreground text-[11px] font-medium tracking-[0.14em] uppercase">
                    Slippage
                  </p>
                  <div
                    role="group"
                    aria-label="Slippage tolerance"
                    className="bg-muted relative mt-2 flex rounded-full p-1"
                  >
                    {SLIPPAGE_PRESETS.map((preset) => {
                      const active =
                        slippage === preset && !slippageInput.trim();
                      return (
                        <button
                          key={preset}
                          type="button"
                          aria-pressed={active}
                          onClick={() => {
                            setSlippage(preset);
                            setSlippageInput("");
                          }}
                          className={cn(
                            "relative flex-1 rounded-full px-2 py-1 text-xs font-medium transition-[transform,background-color,color] duration-100 ease-out active:scale-[0.97]",
                            FOCUS,
                          )}
                        >
                          {active && (
                            <motion.span
                              layoutId={`sp-slip-${uid}`}
                              transition={SPRING}
                              className="border-border/70 bg-card dark:bg-muted absolute inset-0 rounded-full border"
                            />
                          )}
                          <span
                            className={cn(
                              "relative",
                              active
                                ? "text-foreground"
                                : "text-muted-foreground",
                            )}
                          >
                            {preset}%
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <label className="border-border/60 bg-muted/50 mt-3 flex items-center gap-2 rounded-full border px-3 py-2">
                    <span className="text-muted-foreground text-xs">
                      Custom
                    </span>
                    <input
                      value={slippageInput}
                      onChange={(event) => {
                        const next = sanitizeNumber(event.target.value);
                        setSlippageInput(next);
                        const value = Number.parseFloat(next);
                        if (
                          Number.isFinite(value) &&
                          value > 0 &&
                          value <= 50
                        ) {
                          setSlippage(value);
                        }
                      }}
                      onBlur={applyCustomSlippage}
                      inputMode="decimal"
                      placeholder="0.5"
                      aria-label="Custom slippage percentage"
                      className="placeholder:text-muted-foreground/50 min-w-0 flex-1 bg-transparent text-right text-xs font-medium tabular-nums outline-none"
                    />
                    <span className="text-muted-foreground text-xs">%</span>
                  </label>
                  <p className="text-muted-foreground mt-2 text-[11px] leading-snug">
                    Applied to the minimum you receive.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {mode === "limit" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={SPRING}
              className="overflow-hidden"
            >
              <div className="border-border/60 bg-muted/50 mt-3 rounded-[18px] border p-3">
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor={limitId}
                    className="text-muted-foreground text-[11px] font-medium tracking-[0.14em] uppercase"
                  >
                    Sell when 1 {pay.symbol} =
                  </label>
                  <button
                    type="button"
                    onClick={() => setLimitInput(null)}
                    aria-label="Reset to the market rate"
                    className={CHIP}
                  >
                    Market
                  </button>
                </div>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <input
                    id={limitId}
                    value={limitInput ?? plainNumber(marketRate)}
                    onChange={(event) =>
                      setLimitInput(sanitizeNumber(event.target.value))
                    }
                    inputMode="decimal"
                    aria-label={`Limit price in ${receive.symbol} per ${pay.symbol}`}
                    className="min-w-0 flex-1 bg-transparent text-xl font-semibold tracking-tight tabular-nums outline-none"
                  />
                  <span className="text-muted-foreground text-sm font-medium">
                    {receive.symbol}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative mt-3 flex flex-col gap-2.5">
          <motion.div
            layout
            transition={SPRING}
            className="border-border/60 bg-muted/50 rounded-[22px] border p-4"
          >
            <motion.div
              key={flips}
              initial={flips === 0 ? false : { y: -10, opacity: 0.4 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground text-[11px] font-medium tracking-[0.14em] uppercase">
                  You pay
                </span>
              </div>
              <div className="mt-1.5 flex h-10 items-center gap-2">
                <input
                  value={amount}
                  onChange={(event) =>
                    setPayAmount(sanitizeNumber(event.target.value))
                  }
                  readOnly={status === "pending"}
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="0"
                  aria-label={`${pay.symbol} amount to pay`}
                  className={cn(
                    "placeholder:text-muted-foreground/35 min-w-0 flex-1 bg-transparent leading-none font-semibold tracking-tight tabular-nums outline-none",
                    amountTextSize(amount || "0"),
                    "transition-[font-size] duration-200 ease-out",
                  )}
                />
                <motion.button
                  layout
                  transition={SPRING}
                  ref={payTriggerRef}
                  type="button"
                  onClick={() => openPicker("pay")}
                  disabled={status === "pending"}
                  aria-haspopup="dialog"
                  aria-label={`Change pay token, currently ${pay.symbol}`}
                  className={cn(
                    TOKEN_PILL,
                    "disabled:pointer-events-none disabled:opacity-50",
                  )}
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div
                      key={pay.symbol}
                      initial={{ opacity: 0, y: 6, filter: "blur(3px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -6, filter: "blur(3px)" }}
                      transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                      className="flex items-center gap-2 pl-1"
                    >
                      <TokenLogo token={pay} className="size-6" />
                      <span className="text-sm font-semibold">
                        {pay.symbol}
                      </span>
                    </motion.div>
                  </AnimatePresence>
                  <ChevronDown className="text-muted-foreground size-4" />
                </motion.button>
              </div>
              <div className="text-muted-foreground mt-2 flex items-center justify-between gap-2 text-xs">
                <span className="tabular-nums">{formatUsd(usdIn)}</span>
                {pay.balance !== undefined && (
                  <span className="flex items-center gap-1.5">
                    <span className="tabular-nums">
                      Balance: {formatAmount(pay.balance, pay.decimals ?? 4)}
                    </span>
                    <button
                      type="button"
                      onClick={() => fillBalance(0.5)}
                      disabled={status === "pending"}
                      className={cn(
                        CHIP,
                        "disabled:pointer-events-none disabled:opacity-50",
                      )}
                    >
                      Half
                    </button>
                    <button
                      type="button"
                      onClick={() => fillBalance(1)}
                      disabled={status === "pending"}
                      className={cn(
                        CHIP,
                        "disabled:pointer-events-none disabled:opacity-50",
                      )}
                    >
                      Max
                    </button>
                  </span>
                )}
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            layout
            transition={SPRING}
            className="border-border/60 bg-muted/50 rounded-[22px] border p-4"
          >
            <motion.div
              key={flips}
              initial={flips === 0 ? false : { y: 10, opacity: 0.4 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground text-[11px] font-medium tracking-[0.14em] uppercase">
                  You receive
                </span>
              </div>
              <div className="mt-1.5 flex h-10 items-center gap-2">
                <p
                  className={cn(
                    "min-w-0 flex-1 truncate leading-none font-semibold tracking-tight tabular-nums",
                    amountTextSize(receiveAmountText),
                    "transition-[font-size] duration-200 ease-out",
                  )}
                >
                  <RollingNumber value={receiveAmountText} />
                </p>
                <motion.button
                  layout
                  transition={SPRING}
                  ref={receiveTriggerRef}
                  type="button"
                  onClick={() => openPicker("receive")}
                  disabled={status === "pending"}
                  aria-haspopup="dialog"
                  aria-label={`Change receive token, currently ${receive.symbol}`}
                  className={cn(
                    TOKEN_PILL,
                    "disabled:pointer-events-none disabled:opacity-50",
                  )}
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div
                      key={receive.symbol}
                      initial={{ opacity: 0, y: 6, filter: "blur(3px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -6, filter: "blur(3px)" }}
                      transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                      className="flex items-center gap-2 pl-1"
                    >
                      <TokenLogo token={receive} className="size-6" />
                      <span className="text-sm font-semibold">
                        {receive.symbol}
                      </span>
                    </motion.div>
                  </AnimatePresence>
                  <ChevronDown className="text-muted-foreground size-4" />
                </motion.button>
              </div>
              <div className="text-muted-foreground mt-2 flex items-center justify-between gap-2 text-xs">
                <span className="tabular-nums">
                  <RollingNumber value={formatUsd(amountOut * receive.price)} />
                </span>
                {receive.balance !== undefined && (
                  <span className="tabular-nums">
                    Balance:{" "}
                    {formatAmount(receive.balance, receive.decimals ?? 4)}
                  </span>
                )}
              </div>
              <span className="sr-only" aria-live="polite">
                {amountOut > 0
                  ? `You receive about ${formatAmount(amountOut, outDecimals)} ${receive.symbol}`
                  : ""}
              </span>
            </motion.div>
          </motion.div>

          <span className="absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
            <motion.button
              type="button"
              onClick={flip}
              disabled={status === "pending"}
              animate={{ rotate: flips * 180 }}
              transition={FLIP_SPRING}
              whileTap={status === "pending" ? undefined : { scale: 0.92 }}
              aria-label="Switch pay and receive tokens"
              className="border-border bg-card hover:bg-muted grid size-9 place-items-center rounded-2xl border shadow-sm transition-[transform,background-color,color] duration-100 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50"
            >
              <ArrowUpDown className="size-4" />
            </motion.button>
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 text-xs">
          <button
            type="button"
            onClick={() => setInvertRate((inverted) => !inverted)}
            aria-label="Invert exchange rate"
            className={cn(
              "text-muted-foreground hover:text-foreground flex min-w-0 items-center gap-1.5 rounded-full transition-[transform,background-color,color] duration-100 ease-out active:scale-[0.97]",
              FOCUS,
            )}
          >
            <span aria-live="polite" className="truncate tabular-nums">
              1 {rateLabel} ≈{" "}
              <span className="text-foreground font-medium">
                <RollingNumber value={formatAmount(rateValue, 6)} />
              </span>{" "}
              {invertRate ? pay.symbol : receive.symbol}
            </span>
          </button>

          <span className="text-muted-foreground flex shrink-0 items-center gap-1.5">
            <span className="sr-only">Quote refreshes automatically</span>
            <svg viewBox="0 0 20 20" aria-hidden className="size-4 -rotate-90">
              <circle
                cx="10"
                cy="10"
                r={RING_RADIUS}
                fill="none"
                stroke="currentColor"
                strokeOpacity="0.2"
                strokeWidth="2"
              />
              {hasAmount && (
                <motion.circle
                  key={quoteTick}
                  cx="10"
                  cy="10"
                  r={RING_RADIUS}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={RING_LENGTH}
                  initial={{ strokeDashoffset: RING_LENGTH }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ duration: interval, ease: "linear" }}
                  onAnimationComplete={refreshQuote}
                />
              )}
            </svg>
          </span>
        </div>

        <div className="mt-2">
          <button
            type="button"
            onClick={() => setDetailsOpen((open) => !open)}
            aria-expanded={detailsOpen}
            aria-controls={detailsId}
            className={cn(
              "text-muted-foreground hover:text-foreground flex w-full items-center justify-between rounded-lg py-1 text-xs font-medium transition-[transform,background-color,color] duration-100 ease-out active:scale-[0.97]",
              FOCUS,
            )}
          >
            <span>Details</span>
            <motion.span
              animate={{ rotate: detailsOpen ? 180 : 0 }}
              transition={SPRING}
              className="inline-flex"
            >
              <ChevronDown className="size-4" />
            </motion.span>
          </button>
          <AnimatePresence initial={false}>
            {detailsOpen && (
              <motion.div
                id={detailsId}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={SPRING}
                className="overflow-hidden"
              >
                <div className="border-border/60 mt-1 border-t pt-1.5">
                  <DetailRow label="Price impact">
                    <span
                      className={cn(
                        impactTone(priceImpact),
                        "transition-colors duration-200",
                      )}
                    >
                      {priceImpact > 0 && priceImpact < 0.01
                        ? "<0.01%"
                        : `${priceImpact.toFixed(2)}%`}
                    </span>
                  </DetailRow>
                  <DetailRow label="Minimum received">
                    <span className="tabular-nums">
                      {formatAmount(minReceived, outDecimals)} {receive.symbol}
                    </span>
                  </DetailRow>
                  <DetailRow label="Network fee">{networkFee}</DetailRow>
                  <DetailRow label="Route">
                    <span className="flex flex-wrap items-center justify-end gap-1.5">
                      <span className="bg-muted rounded-full px-2 py-0.5 text-[11px] font-medium">
                        {pay.symbol}
                      </span>
                      <ArrowRight
                        aria-hidden
                        className="text-muted-foreground size-3"
                      />
                      <span className="bg-muted rounded-full px-2 py-0.5 text-[11px] font-medium">
                        {receive.symbol}
                      </span>
                      <span className="text-muted-foreground text-[11px]">
                        via {route.join(" · ")}
                      </span>
                    </span>
                  </DetailRow>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative mt-3">
          <motion.div
            animate={
              status === "error" ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }
            }
            transition={{ duration: 0.36, ease: "easeInOut" }}
          >
            <motion.button
              type="button"
              onClick={handleSwap}
              disabled={disabled}
              whileHover={disabled ? undefined : { y: -1 }}
              whileTap={disabled ? undefined : { scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 26 }}
              className={cn(
                "focus-visible:ring-offset-background focus-visible:ring-ring relative isolate flex h-14 w-full items-center justify-center overflow-hidden rounded-full text-sm font-semibold tracking-tight shadow-[inset_0_1px_0_rgba(255,255,255,0.55),inset_0_-10px_18px_-10px_rgba(15,23,42,0.18)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                accent === DEFAULT_ACCENT
                  ? "text-primary-foreground"
                  : "text-neutral-950",
                disabled && "cursor-not-allowed opacity-60 saturate-50",
              )}
            >
              <span
                aria-hidden
                className="absolute inset-0"
                style={{ background: accent }}
              />
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-80 mix-blend-overlay"
                style={{
                  backgroundImage: `url("${NOISE_URI}")`,
                  backgroundSize: "120px",
                }}
              />
              <span className="relative z-10 flex items-center justify-center gap-2">
                {status === "pending" && (
                  <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />
                )}
                {status === "success" && (
                  <motion.svg
                    viewBox="0 0 24 24"
                    className="size-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  >
                    <motion.path
                      d="M5 12.5l4.5 4.5L19 7.5"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                    />
                  </motion.svg>
                )}
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
              </span>
            </motion.button>
          </motion.div>
          <span role="status" className="sr-only">
            {status === "success"
              ? "Swap complete"
              : status === "error"
                ? "Swap failed. Try again."
                : ""}
          </span>
        </div>

        <AnimatePresence>
          {picker && (
            <motion.div
              key="token-picker"
              role="dialog"
              aria-modal="true"
              aria-labelledby={pickerTitleId}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.stopPropagation();
                  closePicker();
                  return;
                }
                trapPickerFocus(event);
              }}
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              transition={SHEET_SPRING}
              className="bg-card absolute inset-0 z-30 flex flex-col overflow-hidden rounded-[27px] max-[400px]:rounded-[23px]"
            >
              <div className="flex items-center justify-between gap-2 px-4 pt-4">
                <h3
                  id={pickerTitleId}
                  className="text-base font-semibold tracking-tight"
                >
                  Select a token
                </h3>
                <button
                  type="button"
                  onClick={closePicker}
                  aria-label="Close token picker"
                  className={cn(
                    "text-muted-foreground hover:bg-muted hover:text-foreground grid size-8 place-items-center rounded-full transition-[transform,background-color,color] duration-100 ease-out active:scale-[0.97]",
                    FOCUS,
                  )}
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="relative mt-3 px-4">
                <Search
                  aria-hidden
                  className="text-muted-foreground pointer-events-none absolute top-1/2 left-7 size-4 -translate-y-1/2"
                />
                <input
                  ref={searchRef}
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search name or symbol"
                  aria-label="Search tokens"
                  autoComplete="off"
                  className="border-border/60 bg-muted/50 placeholder:text-muted-foreground/60 focus-visible:ring-ring h-10 w-full rounded-full border pr-3 pl-9 text-sm outline-none focus-visible:ring-2"
                />
              </div>

              <div className="mt-3 px-4">
                <p className="text-muted-foreground text-[11px] font-medium tracking-[0.14em] uppercase">
                  Popular
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {tokens.slice(0, 4).map((token) => (
                    <button
                      key={token.symbol}
                      type="button"
                      onClick={() => selectToken(token)}
                      className="bg-muted hover:bg-muted/70 focus-visible:ring-ring flex items-center gap-1.5 rounded-full py-1 pr-2.5 pl-1 text-xs font-medium transition-[transform,background-color,color] duration-100 ease-out focus-visible:ring-2 focus-visible:outline-none active:scale-[0.97]"
                    >
                      <TokenLogo token={token} className="size-4" />
                      {token.symbol}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-3 min-h-0 flex-1 overflow-y-auto px-2 pb-3">
                <div key={picker} role="listbox" aria-label="Tokens">
                  {filtered.map((token, index) => {
                    const selected = token.symbol === currentPickerToken.symbol;
                    return (
                      <motion.button
                        key={token.symbol}
                        type="button"
                        role="option"
                        aria-selected={selected}
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
                          "hover:bg-muted/60 focus-visible:ring-ring flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-left transition-[transform,background-color,color] duration-100 ease-out focus-visible:ring-2 focus-visible:outline-none active:scale-[0.97]",
                          selected && "bg-muted/40",
                        )}
                      >
                        <TokenLogo token={token} className="size-8" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold">
                            {token.symbol}
                          </span>
                          <span className="text-muted-foreground block truncate text-xs">
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
                            <span className="text-muted-foreground block text-[11px] tabular-nums">
                              {formatUsd(token.balance * token.price)}
                            </span>
                          )}
                        </span>
                      </motion.button>
                    );
                  })}
                  {filtered.length === 0 && (
                    <p className="text-muted-foreground px-3 py-8 text-center text-sm">
                      No tokens found
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </MotionConfig>
  );
}

export { SwapPanel };
