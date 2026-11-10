"use client";

import { Check, Copy, Plus } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";

import { cn } from "@/lib/utils";

export interface GlyphCardToken {
  symbol: string;
  amount: number;
  /** USD value of `amount`. */
  value: number;
  logo?: string;
}

export interface GlyphCardProps {
  chain: string;
  /** Network logo URL. Without it the chain's first letter is shown. */
  logo?: string;
  /** Full address; shown shortened, copied in full. */
  address: string;
  /** Total balance in USD. */
  balance: number;
  token?: GlyphCardToken;
  /** Accent colour for the glyph field and card tint (any CSS colour). */
  color?: string;
  /** Shows the round + button when set. */
  onAdd?: () => void;
  className?: string;
}

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
const AMOUNT = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
});
// Never let a nonzero holding round down to "0.00".
const formatAmount = (n: number) =>
  n !== 0 && Math.abs(n) < 0.0001 ? "<0.0001" : AMOUNT.format(n);
const RAMP = " .:-=+*#%@";
const CELL = 7; // px per block/glyph cell
const FPS = 12; // stepped frame rate: retro feel, low CPU

const shorten = (a: string) =>
  a.length > 12 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a;

// Canvas glyph field. A drifting "mass" per cell is drawn as a solid block
// (dense, left), a RAMP character (mid) or nothing (light, right).
function useGlyphField(color: string, reduce: boolean | null) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let w = 0;
    let h = 0;
    let cols = 0;
    let rows = 0;
    let grain = new Float32Array(0);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `600 ${CELL + 1}px ui-monospace, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      cols = Math.ceil(w / CELL);
      rows = Math.ceil(h / CELL);
      // Per-cell static noise, computed once per size instead of per frame.
      grain = new Float32Array(cols * rows);
      for (let k = 0; k < grain.length; k++) {
        const n =
          Math.sin((k % cols) * 12.9898 + (k / cols) * 78.233) * 43758.5453;
        grain[k] = n - Math.floor(n) - 0.5;
      }
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = color;
      for (let j = 0; j < rows; j++) {
        const v = j / rows;
        for (let i = 0; i < cols; i++) {
          const u = i / cols;
          const mass =
            1 -
            u * 1.25 +
            0.3 * Math.sin(v * 5 + u * 2.5 + t * 0.5) +
            0.18 * Math.sin(u * 9 - v * 3 - t * 0.35) +
            0.12 * grain[j * cols + i];
          const x = i * CELL;
          const y = j * CELL;
          if (mass > 0.72) {
            ctx.globalAlpha = mass > 0.95 ? 0.72 : 0.5;
            ctx.fillRect(x, y, CELL, CELL);
          } else if (mass > 0.12) {
            const k = Math.min(9, Math.floor(((mass - 0.12) / 0.6) * 10));
            ctx.globalAlpha = 0.45 + mass * 0.6;
            ctx.fillText(RAMP[k], x + CELL / 2, y + CELL / 2);
          }
        }
      }
      ctx.globalAlpha = 1;
    };

    resize();
    draw(0);
    const ro = new ResizeObserver(() => {
      resize();
      draw(performance.now() / 1000);
    });
    ro.observe(canvas);
    if (reduce) return () => ro.disconnect();

    let visible = true;
    // Entries can batch; the last one is the current state.
    const io = new IntersectionObserver(
      (entries) => (visible = entries[entries.length - 1].isIntersecting),
    );
    io.observe(canvas);

    let raf = 0;
    let last = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || now - last < 1000 / FPS) return;
      last = now;
      draw(now / 1000);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [color, reduce]);

  return ref;
}

function Mark() {
  return (
    <svg
      viewBox="0 0 40 40"
      className="size-10 fill-neutral-950 max-[400px]:size-9"
      aria-hidden
    >
      <g transform="translate(9.5 9.5)">
        <circle cy="-4.6" r="3.8" />
        <circle cy="4.6" r="3.8" />
        <circle cx="-4.6" r="3.8" />
        <circle cx="4.6" r="3.8" />
      </g>
      <circle cx="30.5" cy="9.5" r="8.5" />
      <rect x="1" y="21" width="17" height="17" rx="5" />
      <rect x="22" y="21" width="17" height="17" rx="8.5" />
    </svg>
  );
}

function GlyphCard({
  chain,
  logo,
  address,
  balance,
  token,
  color = "#8b65ec",
  onAdd,
  className,
}: GlyphCardProps) {
  const reduce = useReducedMotion();
  const canvasRef = useGlyphField(color, reduce);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard unavailable (insecure context or denied): stay idle.
    }
  };

  const total = USD.format(Number.isFinite(balance) ? balance : 0);
  // Shrink long balances so they never wrap.
  const scale = Math.min(1, 9 / total.length);
  const tap = reduce ? undefined : { scale: 0.92 };

  return (
    <article
      style={{ "--glyph": color } as CSSProperties}
      aria-label={`${chain} wallet`}
      className={cn(
        "relative isolate h-[230px] w-full max-w-[340px] overflow-hidden rounded-[30px] bg-[color-mix(in_oklab,var(--glyph)_14%,white)] text-neutral-950 max-[400px]:h-[214px] max-[400px]:rounded-[26px]",
        className,
      )}
    >
      <canvas
        ref={canvasRef}
        aria-hidden
        className="absolute inset-0 -z-10 size-full"
      />
      {/* Glass rim */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] ring-2 ring-white/60 ring-inset"
      />

      <div className="absolute top-4 right-4 max-[400px]:top-3.5 max-[400px]:right-3.5">
        <Mark />
      </div>

      <div className="flex h-full flex-col p-4 pb-3.5 max-[400px]:p-3.5 max-[400px]:pb-3">
        <div className="flex min-w-0 items-center gap-2 pr-12">
          <span className="grid size-7 shrink-0 place-items-center overflow-hidden rounded-full bg-white text-xs font-bold ring-1 ring-black/5">
            {logo ? (
              <Image src={logo} alt="" width={20} height={20} />
            ) : (
              chain.charAt(0).toUpperCase()
            )}
          </span>
          <span className="truncate text-[17px] font-semibold tracking-tight">
            {chain}
          </span>
        </div>

        <p
          className="mt-1 leading-none font-extrabold tracking-[-0.03em] whitespace-nowrap tabular-nums"
          style={{ fontSize: `calc(clamp(2.25rem, 11vw, 2.75rem) * ${scale})` }}
        >
          {total}
        </p>

        {token && (
          <div className="mt-2.5 flex items-center justify-between gap-3 text-xs font-semibold">
            <span className="flex min-w-0 items-center gap-1.5">
              {token.logo && (
                <Image
                  src={token.logo}
                  alt=""
                  width={16}
                  height={16}
                  className="shrink-0 rounded-full"
                />
              )}
              <span className="truncate">
                {formatAmount(token.amount)} {token.symbol}
              </span>
            </span>
            <span className="shrink-0 tabular-nums">
              {USD.format(token.value)}
            </span>
          </div>
        )}

        <div className="mt-auto flex items-center gap-2">
          {onAdd && (
            <motion.button
              type="button"
              aria-label="Add funds"
              onClick={onAdd}
              whileTap={tap}
              whileHover={reduce ? undefined : "hover"}
              className="grid size-[52px] shrink-0 place-items-center rounded-full bg-neutral-950 text-white outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 max-[400px]:size-12"
            >
              <motion.span
                variants={{ hover: { rotate: 90 } }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Plus className="size-6" strokeWidth={2.5} />
              </motion.span>
            </motion.button>
          )}

          <div className="flex h-[52px] min-w-0 flex-1 items-center justify-between gap-2 rounded-full bg-neutral-950 pr-2 pl-5 text-white max-[400px]:h-12 max-[400px]:pl-4">
            <span className="truncate font-mono text-base tracking-tight max-[400px]:text-sm">
              {shorten(address)}
            </span>
            <motion.button
              type="button"
              onClick={copy}
              aria-label="Copy address"
              whileTap={tap}
              className="flex h-8 shrink-0 items-center gap-1 rounded-full bg-white/15 px-2.5 text-[11px] font-semibold tracking-wide transition-colors outline-none hover:bg-white/25 focus-visible:ring-2 focus-visible:ring-white/70"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={copied ? "done" : "copy"}
                  initial={{ opacity: 0, scale: 0.6, filter: "blur(2px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 0.6, filter: "blur(2px)" }}
                  transition={{ duration: 0.14 }}
                  className="flex items-center gap-1"
                >
                  {copied ? (
                    <Check className="size-3.5" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                  <span className="max-[360px]:sr-only">
                    {copied ? "COPIED" : "COPY"}
                  </span>
                </motion.span>
              </AnimatePresence>
            </motion.button>
            <span className="sr-only" aria-live="polite">
              {copied ? "Address copied" : ""}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

export default GlyphCard;
export { GlyphCard };
