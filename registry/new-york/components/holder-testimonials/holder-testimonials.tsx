"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { BadgeCheck, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type HolderTestimonial = {
  name: string;
  address: `0x${string}` | string;
  role?: string;
  quote: string;
  avatar?: string;
  chain?: string;
  holding?: { amount: string; symbol: string };
  verified?: boolean;
  since?: string;
  /** Overrides the chain palette. */
  bg?: string;
  text?: string;
};

type HolderTestimonialsProps = {
  testimonials: HolderTestimonial[];
  label?: string;
  className?: string;
};

const EASE = [0.65, 0, 0.2, 1] as const;

// Muted take on each chain's brand hue, paired with a text colour that keeps
// at least 7:1 contrast (and 4:1 for the dimmed secondary text).
export const chainPalettes: Record<string, { bg: string; text: string }> = {
  ethereum: { bg: "#c9d2f7", text: "#151a3d" },
  base: { bg: "#274690", text: "#e9efff" },
  arc: { bg: "#d6ebe6", text: "#0c2a27" },
  bitcoin: { bg: "#f2a65a", text: "#2a1404" },
  solana: { bg: "#123c33", text: "#c9f7e3" },
};
const ALIASES: Record<string, string> = {
  eth: "ethereum",
  btc: "bitcoin",
  sol: "solana",
};
const NEUTRAL = { bg: "#e9e2d4", text: "#16130f" };

function paletteFor(item: HolderTestimonial) {
  const key = item.chain?.toLowerCase() ?? "";
  const base = chainPalettes[ALIASES[key] ?? key] ?? NEUTRAL;
  return { bg: item.bg ?? base.bg, text: item.text ?? base.text };
}

function shortenAddress(address: string) {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function HolderAvatar({
  avatar,
  name,
  size,
  radius,
}: {
  avatar?: string;
  name: string;
  size: number;
  radius: number;
}) {
  const [failed, setFailed] = useState(false);
  const show = Boolean(avatar) && !failed;
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative flex-none overflow-hidden",
        show ? "bg-white/12" : "bg-black/12",
      )}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
      }}
    >
      {show ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatar}
          alt=""
          width={size}
          height={size}
          draggable={false}
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full rounded-full object-cover p-1.5"
          style={{ objectFit: "contain" }}
        />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center text-[13px] font-medium">
          {initials(name)}
        </span>
      )}
    </div>
  );
}

export function HolderTestimonials({
  testimonials,
  label = "Holder testimonials",
  className,
}: HolderTestimonialsProps) {
  const [selected, setSelected] = useState(0);
  const [tablistWidth, setTablistWidth] = useState(700);
  const [copied, setCopied] = useState<string | null>(null);
  const reduce = useReducedMotion();
  const tabRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tablistRef = useRef<HTMLDivElement | null>(null);
  const count = testimonials.length;
  const baseId = useId();
  // Stay valid when the list shrinks, so exactly one tab is always focusable.
  const current = Math.min(selected, Math.max(count - 1, 0));
  const resetTimer = useRef<number>(0);

  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  useEffect(() => {
    const el = tablistRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width) setTablistWidth(width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Horizontal only when the open tab (min 280) and the collapsed ones fit.
  const isVertical = tablistWidth < Math.max(560, 280 + (count - 1) * 52);
  const activeWidth = Math.max(
    280,
    tablistWidth - (count - 1) * 48 - (count - 1) * 4,
  );

  const moveFocus = (i: number) => {
    tabRefs.current[i]?.focus();
  };

  const select = (i: number) => {
    setSelected(i);
  };

  const handleKeyDown = (e: React.KeyboardEvent, i: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      select(i);
    } else if (
      e.key === "ArrowRight" ||
      (isVertical && e.key === "ArrowDown")
    ) {
      e.preventDefault();
      const n = (i + 1) % count;
      select(n);
      moveFocus(n);
    } else if (e.key === "ArrowLeft" || (isVertical && e.key === "ArrowUp")) {
      e.preventDefault();
      const p = (i - 1 + count) % count;
      select(p);
      moveFocus(p);
    }
  };

  const copyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
    } catch {
      return;
    }
    setCopied(address);
    window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setCopied(null), 1500);
  };

  const tabTransition = reduce
    ? { duration: 0 }
    : { duration: 0.5, ease: EASE };

  return (
    <div
      ref={tablistRef}
      role="tablist"
      aria-label={label}
      aria-orientation={isVertical ? "vertical" : "horizontal"}
      className={cn(
        isVertical
          ? "flex w-[700px] max-w-full flex-col items-center gap-[4px]"
          : "flex h-[434px] w-[700px] max-w-full items-center gap-1",
        className,
      )}
    >
      {testimonials.map((item, i) => {
        const active = i === current;
        const tabId = `${baseId}-tab-${i}`;
        const panelId = `${baseId}-panel-${i}`;
        const enter = (delay: number) =>
          reduce
            ? { duration: 0 }
            : active
              ? { duration: 0.4, ease: EASE, delay }
              : { duration: 0.12 };
        return (
          <motion.div
            key={`${item.name}-${i}`}
            role="none"
            animate={
              isVertical
                ? {
                    // Overwrites the px width left over from horizontal mode.
                    width: "100%",
                    height: active ? 380 : 48,
                    borderRadius: active ? 14 : 24,
                  }
                : {
                    width: active ? activeWidth : 48,
                    height: active ? 434 : 354,
                    borderRadius: active ? 14 : 24,
                  }
            }
            whileHover={
              !active && !isVertical && !reduce ? { height: 366 } : undefined
            }
            transition={tabTransition}
            className={
              isVertical
                ? "relative isolate w-full overflow-hidden text-left"
                : "relative isolate flex-none overflow-hidden text-left"
            }
            style={{
              backgroundColor: paletteFor(item).bg,
              color: paletteFor(item).text,
              cursor: active ? "default" : "pointer",
            }}
          >
            <div
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              id={tabId}
              role="tab"
              aria-selected={active}
              aria-controls={panelId}
              aria-label={item.name}
              tabIndex={active ? 0 : -1}
              onClick={() => select(i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              className="absolute inset-0 rounded-[inherit] outline-none focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-[#1490f7]"
            />
            {/* Expanded content */}
            <div
              id={panelId}
              role="tabpanel"
              aria-labelledby={tabId}
              aria-hidden={!active}
              inert={!active}
              className="pointer-events-none absolute top-0 left-0 h-[434px] overflow-hidden"
              style={{
                // Final size from the start, so text never rewraps mid-animation.
                width: isVertical ? "100%" : activeWidth,
                height: isVertical ? 380 : undefined,
              }}
            >
              <motion.div
                className="absolute top-[22px] right-[22px] bottom-[100px] left-[22px] overflow-hidden"
                animate={
                  active
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: reduce ? 0 : 8 }
                }
                transition={enter(0.15)}
              >
                <div className="flex items-start justify-between">
                  <svg
                    width="30"
                    height="24"
                    viewBox="0 0 26 21"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M0 20.5V12C0 5.4 3.6 1.3 10.2 0l1.3 2.6C7.9 3.8 6 6.3 5.8 9.6H11v10.9H0zm15 0V12c0-6.6 3.6-10.7 10.2-12l1.3 2.6c-3.6 1.2-5.5 3.7-5.7 7H26v10.9H15z"
                      fill="currentColor"
                    />
                  </svg>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-[12px] tabular-nums opacity-60">
                      {String(i + 1).padStart(2, "0")} /{" "}
                      {String(count).padStart(2, "0")}
                    </span>
                    {item.role || item.since ? (
                      <span className="text-[12px] opacity-75">
                        {item.role}
                        {item.role && item.since ? " · " : ""}
                        {item.since ? `Since ${item.since}` : ""}
                      </span>
                    ) : null}
                  </div>
                </div>
                <p
                  className={
                    isVertical
                      ? "m-0 mt-[22px] line-clamp-7 text-[22px] leading-[1.12] tracking-[-0.03em]"
                      : "m-0 mt-[22px] line-clamp-6 text-[28px] leading-[1.12] tracking-[-0.03em]"
                  }
                >
                  {item.quote}
                </p>
              </motion.div>

              <motion.div
                className="absolute right-[22px] bottom-[22px] left-[22px] flex items-center gap-3 pt-4"
                animate={
                  active
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: reduce ? 0 : 8 }
                }
                transition={enter(0.25)}
              >
                <motion.div
                  aria-hidden
                  className="absolute top-0 right-0 left-0 h-px origin-left bg-current opacity-25"
                  animate={active ? { scaleX: 1 } : { scaleX: 0 }}
                  transition={enter(0.25)}
                />
                <HolderAvatar
                  avatar={item.avatar}
                  name={item.name}
                  size={52}
                  radius={12}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-[15px] leading-[1.2] tracking-[-0.01em]">
                    {item.name}
                    {item.verified ? (
                      <BadgeCheck size={15} aria-label="Verified holder" />
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      void copyAddress(item.address);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation();
                      }
                    }}
                    className="pointer-events-auto mt-[3px] flex items-center gap-1 font-mono text-[12px] opacity-75 outline-none hover:opacity-100 focus-visible:underline"
                    aria-label="Copy address"
                  >
                    {copied === item.address ? (
                      <>
                        <Check size={12} aria-hidden="true" />
                        <span aria-live="polite">Copied</span>
                      </>
                    ) : (
                      <span>{shortenAddress(item.address)}</span>
                    )}
                  </button>
                </div>
                {item.holding || item.chain ? (
                  <div className="flex flex-col items-end text-right">
                    {item.holding ? (
                      <span className="text-[15px] tracking-[-0.01em] tabular-nums">
                        {item.holding.amount} {item.holding.symbol}
                      </span>
                    ) : null}
                    {item.chain ? (
                      <span className="text-[12px] opacity-75">
                        {item.chain}
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </motion.div>
            </div>

            {/* Collapsed strip */}
            <motion.div
              aria-hidden
              className={
                isVertical
                  ? "pointer-events-none absolute top-0 right-0 left-0 flex h-[48px] flex-row items-center"
                  : "pointer-events-none absolute top-0 bottom-0 left-0 w-[48px]"
              }
              animate={active ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: reduce ? 0 : 0.2 }}
            >
              {isVertical ? (
                <div className="flex h-[48px] w-full flex-row items-center">
                  <div className="ml-[6px]">
                    <HolderAvatar
                      avatar={item.avatar}
                      name={item.name}
                      size={36}
                      radius={18}
                    />
                  </div>
                  <span className="ml-[12px] truncate text-[15px] font-medium whitespace-nowrap">
                    {item.name}
                  </span>
                </div>
              ) : (
                <>
                  <div className="flex h-full w-full items-center justify-center pb-[42px]">
                    <span
                      className="text-[14px] font-medium tracking-[-0.01em] whitespace-nowrap"
                      style={{
                        writingMode: "vertical-rl",
                        transform: "rotate(180deg)",
                      }}
                    >
                      {item.name}
                    </span>
                  </div>
                  <div className="absolute bottom-1.5 left-1.5">
                    <HolderAvatar
                      avatar={item.avatar}
                      name={item.name}
                      size={36}
                      radius={18}
                    />
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default HolderTestimonials;
export type { HolderTestimonial, HolderTestimonialsProps };
