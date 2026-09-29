"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useDragControls,
  useReducedMotion,
  type Transition,
} from "motion/react";
import { Check, Copy, ExternalLink, RefreshCw, X } from "lucide-react";
/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export interface DepositTokenInfo {
  /** e.g. `"USDC"` */
  symbol: string;
  iconUrl: string;
}

export interface DepositNetworkInfo {
  /** e.g. `"Solana"` */
  name: string;
  iconUrl: string;
  /** Any CSS color. Tints the glow, focus ring and copy confirmation. */
  color?: string;
}

export interface DepositModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address: string;
  amount?: string;
  /** Small label above the amount. */
  amountLabel?: string;
  token: DepositTokenInfo;
  network: DepositNetworkInfo;
  explorerBaseUrl?: string;
  /** Shown in the footer strip, e.g. `"10"`. */
  minDeposit?: string;
  /** When these deposit details stop being valid. */
  expiresAt?: Date | number;
  /** Extra footer copy, appended after the built-in "send only" warning. */
  notice?: React.ReactNode;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

/* -------------------------------------------------------------------------- */
/*  Styles (scoped, theme-token driven)                                       */
/* -------------------------------------------------------------------------- */

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.6'/%3E%3C/svg%3E\")";

const CSS = `
.dm-root{
  --n:10px;
  --m-top:
    radial-gradient(circle var(--n) at 0 100%,#0000 98%,#000) left/51% 100% no-repeat,
    radial-gradient(circle var(--n) at 100% 100%,#0000 98%,#000) right/51% 100% no-repeat;
  --m-stub:
    radial-gradient(circle var(--n) at 0 0,#0000 98%,#000) left/51% 100% no-repeat,
    radial-gradient(circle var(--n) at 100% 0,#0000 98%,#000) right/51% 100% no-repeat;
  /* Silhouette hairline (right edge included): a plain border would be
     clipped away by the notch masks, so the outline is traced with
     drop-shadow, which follows the full silhouette â€” straight edges and
     notch curves alike. No scale animation runs on this panel, so the
     shadow layer never resamples mid-animation. */
  filter:drop-shadow(0 0 1px var(--border));
}
.dm-piece{
  position:relative;overflow:hidden;
  background:var(--card);
}
.dm-top{
  border-radius:22px 22px 0 0;
  -webkit-mask:var(--m-top);mask:var(--m-top);
}
.dm-stub{
  border-radius:0 0 22px 22px;
  -webkit-mask:var(--m-stub);mask:var(--m-stub);
}
.dm-grain::after{
  content:"";position:absolute;inset:0;pointer-events:none;opacity:.05;background-image:${GRAIN};
}
.dm-in{position:relative;z-index:1}
.dm-perf{
  position:absolute;z-index:1;top:0;left:18px;right:18px;
  border-top:1px dashed color-mix(in oklab,var(--foreground) 26%,transparent);
}
.dm-hatch{
  background:color-mix(in oklab,var(--muted) 55%,transparent);
  border-top:1px solid var(--border);
}
.dm-display{font-family:var(--dm-display,var(--font-sans,ui-sans-serif,system-ui,sans-serif))}
.dm-mono{font-family:var(--dm-mono,var(--font-mono,ui-monospace,SFMono-Regular,Menlo,monospace))}
.dm-focus:focus-visible{outline:2px solid var(--net);outline-offset:2px}
`;

let bodyLockCount = 0;
let savedBodyOverflow: string | null = null;

/* -------------------------------------------------------------------------- */
/*  Small hooks                                                               */
/* -------------------------------------------------------------------------- */

function useIsSheet() {
  const [sheet, setSheet] = React.useState(false);
  React.useEffect(() => {
    const m = window.matchMedia("(max-width: 639px)");
    const sync = () => setSheet(m.matches);
    sync();
    m.addEventListener("change", sync);
    return () => m.removeEventListener("change", sync);
  }, []);
  return sheet;
}

function useSecondsLeft(expiresAt?: Date | number) {
  const timestamp = expiresAt == null ? null : +new Date(expiresAt);
  const target =
    timestamp != null && Number.isFinite(timestamp) ? timestamp : null;
  const [now, setNow] = React.useState(() => Date.now());
  React.useLayoutEffect(() => {
    if (target == null) return;
    const updateNow = () => setNow(Date.now());
    updateNow();
    const id = setInterval(updateNow, 1000);
    return () => clearInterval(id);
  }, [target]);
  return target == null ? null : Math.max(0, Math.round((target - now) / 1000));
}

const formatClock = (s: number) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/* -------------------------------------------------------------------------- */
/*  Pieces                                                                    */
/* -------------------------------------------------------------------------- */

/** Icon with a lettered fallback when the image fails to load. */
const Icon = ({
  src,
  label,
  className,
}: {
  src: string;
  label: string;
  className: string;
}) => {
  const [failed, setFailed] = React.useState(false);
  if (failed) {
    return (
      <span
        aria-hidden
        className={`${className} bg-muted text-muted-foreground grid place-items-center text-[10px] font-semibold`}
      >
        {label.slice(0, 1)}
      </span>
    );
  }
  return (
    <Image
      src={src}
      alt=""
      width={28}
      height={28}
      sizes="28px"
      onError={() => setFailed(true)}
      className={`${className} object-contain`}
    />
  );
};

/** Address with its first and last four characters emphasized. */
const AddressKey = ({ address }: { address: string }) => {
  if (address.length <= 10) return <>{address}</>;
  return (
    <>
      <span className="text-foreground font-semibold">
        {address.slice(0, 4)}
      </span>
      <span className="text-muted-foreground">{address.slice(4, -4)}</span>
      <span className="text-foreground font-semibold">{address.slice(-4)}</span>
    </>
  );
};

/* -------------------------------------------------------------------------- */
/*  Modal                                                                     */
/* -------------------------------------------------------------------------- */

const DepositModal = ({
  open,
  onOpenChange,
  address,
  amount = "0.000",
  amountLabel,
  token,
  network,
  explorerBaseUrl = "https://solscan.io/account",
  minDeposit,
  expiresAt,
  notice,
  onRefresh,
  isRefreshing = false,
}: DepositModalProps) => {
  const reduce = !!useReducedMotion();
  const isSheet = useIsSheet();
  const dragControls = useDragControls();
  const uid = React.useId();
  const titleId = `${uid}-title`;
  const descId = `${uid}-desc`;

  const [mounted, setMounted] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const copyRef = React.useRef<HTMLButtonElement>(null);
  const copyTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const pressStartedOnBackdrop = React.useRef(false);
  const onOpenChangeRef = React.useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;

  const secondsLeft = useSecondsLeft(open ? expiresAt : undefined);
  const isExpired = secondsLeft === 0;
  const canRefresh = typeof onRefresh === "function";
  const close = React.useCallback(() => onOpenChangeRef.current(false), []);
  const explorerHref = React.useMemo(() => {
    if (!address.trim() || isExpired) return null;
    try {
      const url = new URL(explorerBaseUrl);
      if (url.protocol !== "https:" && url.protocol !== "http:") return null;
      url.pathname = `${url.pathname.replace(/\/+$/, "")}/${encodeURIComponent(address)}`;
      return url.href;
    } catch {
      return null;
    }
  }, [address, explorerBaseUrl, isExpired]);

  React.useEffect(() => setMounted(true), []);
  React.useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    },
    [],
  );
  React.useEffect(() => {
    setCopied(false);
    if (copyTimer.current) clearTimeout(copyTimer.current);
  }, [address, open]);

  // Escape, scroll lock without layout shift, focus in / focus restore.
  React.useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChangeRef.current(false);
    };
    document.addEventListener("keydown", onKey);

    if (bodyLockCount === 0) {
      savedBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    bodyLockCount += 1;
    const raf = requestAnimationFrame(() => {
      if (copyRef.current?.disabled) closeRef.current?.focus();
      else copyRef.current?.focus();
    });

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
      bodyLockCount -= 1;
      if (bodyLockCount === 0 && savedBodyOverflow !== null) {
        document.body.style.overflow = savedBodyOverflow;
        savedBodyOverflow = null;
      }
      previouslyFocused?.focus?.();
    };
  }, [open]);

  const trapTab = (e: React.KeyboardEvent) => {
    if (e.key !== "Tab") return;
    const nodes = panelRef.current?.querySelectorAll<HTMLElement>(
      'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])',
    );
    if (!nodes || nodes.length === 0) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const copyAddress = async () => {
    if (!address.trim() || isExpired) return;
    let didCopy = false;
    try {
      await navigator.clipboard.writeText(address);
      didCopy = true;
    } catch {
      const ta = document.createElement("textarea");
      ta.value = address;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      try {
        document.body.appendChild(ta);
        ta.select();
        didCopy = document.execCommand("copy");
      } finally {
        ta.remove();
      }
    }
    if (!didCopy) return;
    navigator.vibrate?.(8);
    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 2200);
  };

  /* ---- motion ---------------------------------------------------------- */

  // Micro open: a short fade-and-nudge tween (no spring, no stagger).
  // Content appears with the panel â€” no choreographed cascade.
  // The mobile sheet keeps its standard slide-up.
  const panelMotion = isSheet
    ? {
        initial: { y: "100%" },
        animate: { y: 0 },
        exit: { y: "100%" },
      }
    : reduce
      ? {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
        }
      : {
          // Opacity + slide only: scaling a masked panel resamples its
          // notch edges every frame, which reads as border flicker.
          initial: { opacity: 0, y: 6 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: 4 },
        };
  const panelTransition: Transition = reduce
    ? { duration: 0 }
    : isSheet
      ? { type: "spring", stiffness: 420, damping: 36 }
      : { duration: 0.18, ease: "easeOut" };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="deposit-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.2 }}
          onPointerDown={(e) => {
            pressStartedOnBackdrop.current = e.target === e.currentTarget;
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && pressStartedOnBackdrop.current)
              close();
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 backdrop-blur-sm sm:p-4"
        >
          <style>{CSS}</style>

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            onKeyDown={trapTab}
            {...panelMotion}
            transition={panelTransition}
            drag={isSheet ? "y" : false}
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.7 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 110 || info.velocity.y > 600) close();
            }}
            className="max-h-[calc(100dvh-1rem)] w-full max-w-[440px] overflow-y-auto overscroll-contain sm:max-h-[calc(100dvh-2rem)]"
          >
            <div
              className="dm-root"
              style={
                { "--net": network.color ?? "#8b7bff" } as React.CSSProperties
              }
            >
              {/* ------------------------- Ticket top ------------------------- */}
              <section className="dm-piece dm-top dm-grain text-foreground px-5 pt-3 pb-7 sm:pt-5">
                <div className="dm-in">
                  {/* Sheet grabber (mobile only) */}
                  <div
                    onPointerDown={(e) => dragControls.start(e)}
                    className="mx-auto mb-2 flex h-5 w-16 cursor-grab touch-none items-center justify-center sm:hidden"
                    aria-hidden
                  >
                    <span className="bg-foreground/20 h-1 w-9 rounded-full" />
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2
                        id={titleId}
                        className="dm-display text-[19px] leading-tight font-semibold tracking-tight"
                      >
                        Deposit {token.symbol}
                      </h2>
                      <p
                        id={descId}
                        className="text-muted-foreground mt-1 text-[13px] leading-snug"
                      >
                        Send {token.symbol} to this address on the{" "}
                        {network.name} network.
                      </p>
                    </div>
                    <button
                      ref={closeRef}
                      type="button"
                      onClick={close}
                      aria-label="Close"
                      className="dm-focus text-muted-foreground hover:bg-foreground/5 hover:text-foreground -mt-2 grid size-9 shrink-0 place-items-center rounded-xl transition-colors"
                    >
                      <X className="size-[18px]" />
                    </button>
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      {amountLabel && (
                        <p className="text-muted-foreground mb-1 text-xs font-medium">
                          {amountLabel}
                        </p>
                      )}
                      <div className="mt-1 flex items-center gap-3">
                        <Icon
                          src={token.iconUrl}
                          label={token.symbol}
                          className="size-7 shrink-0 rounded-full"
                        />
                        <span className="dm-display flex items-baseline gap-1.5">
                          <span className="relative inline-flex min-w-0 overflow-hidden text-[clamp(1.5rem,9vw,2.375rem)] leading-none font-semibold tracking-[-0.03em] break-all tabular-nums">
                            <AnimatePresence mode="popLayout" initial={false}>
                              <motion.span
                                key={amount}
                                initial={
                                  reduce
                                    ? false
                                    : {
                                        y: "45%",
                                        opacity: 0,
                                        filter: "blur(3px)",
                                      }
                                }
                                animate={{
                                  y: 0,
                                  opacity: 1,
                                  filter: "blur(0px)",
                                }}
                                exit={
                                  reduce
                                    ? { opacity: 0 }
                                    : {
                                        y: "-45%",
                                        opacity: 0,
                                        filter: "blur(3px)",
                                      }
                                }
                                transition={{ duration: reduce ? 0 : 0.22 }}
                                className="inline-block"
                              >
                                {amount}
                              </motion.span>
                            </AnimatePresence>
                          </span>
                          <span className="text-muted-foreground text-sm font-medium">
                            {token.symbol}
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="flex min-w-0 shrink-0 items-center gap-1">
                      <span className="bg-foreground/6 flex min-w-0 items-center gap-1.5 rounded-xl py-2 pr-2.5 pl-1.5 text-xs font-medium">
                        <Icon
                          src={network.iconUrl}
                          label={network.name}
                          className="size-4 rounded-full"
                        />
                        <span className="max-w-24 truncate sm:max-w-32">
                          {network.name}
                        </span>
                      </span>
                      {canRefresh && (
                        <button
                          type="button"
                          onClick={onRefresh}
                          disabled={isRefreshing}
                          aria-label="Refresh deposit details"
                          className="dm-focus text-muted-foreground hover:bg-foreground/5 hover:text-foreground grid size-8 place-items-center rounded-full transition-colors disabled:pointer-events-none"
                        >
                          <motion.span
                            className="block"
                            animate={
                              reduce
                                ? undefined
                                : { rotate: isRefreshing ? 360 : 0 }
                            }
                            transition={
                              isRefreshing
                                ? {
                                    repeat: Infinity,
                                    duration: 0.9,
                                    ease: "linear",
                                  }
                                : { duration: 0 }
                            }
                          >
                            <RefreshCw className="size-4" />
                          </motion.span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* --------------------------- Ticket stub ---------------------- */}
              <section className="dm-piece dm-stub dm-grain text-foreground">
                <span className="dm-perf" aria-hidden />

                <div className="dm-in px-5 pb-5">
                  <div className="mt-5 mb-2.5 flex items-center justify-between">
                    <p className="text-[13px] font-medium">Deposit address</p>
                    {explorerHref && (
                      <a
                        href={explorerHref}
                        target="_blank"
                        rel="noreferrer"
                        className="dm-focus text-muted-foreground hover:text-foreground flex shrink-0 items-center gap-1 rounded text-xs font-medium transition-colors"
                      >
                        View on explorer
                        <ExternalLink className="size-3.5" />
                      </a>
                    )}
                  </div>

                  <div>
                    <button
                      ref={copyRef}
                      type="button"
                      onClick={copyAddress}
                      disabled={!address.trim() || isExpired}
                      aria-label="Copy deposit address"
                      className="dm-focus bg-foreground/[0.05] hover:bg-foreground/[0.08] flex w-full items-center gap-3 rounded-xl py-2 pr-3 pl-3.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span className="dm-mono min-w-0 flex-1 text-[13px] leading-6 tracking-wide break-all">
                        <AddressKey address={address} />
                      </span>
                      <span className="bg-background/70 text-muted-foreground grid size-9 shrink-0 place-items-center rounded-xl">
                        <AnimatePresence mode="popLayout" initial={false}>
                          <motion.span
                            key={copied ? "done" : "idle"}
                            initial={
                              reduce
                                ? false
                                : {
                                    opacity: 0,
                                    scale: 0.6,
                                    filter: "blur(3px)",
                                  }
                            }
                            animate={{
                              opacity: 1,
                              scale: 1,
                              filter: "blur(0px)",
                            }}
                            exit={
                              reduce
                                ? { opacity: 0 }
                                : {
                                    opacity: 0,
                                    scale: 0.6,
                                    filter: "blur(3px)",
                                  }
                            }
                            transition={{ duration: reduce ? 0 : 0.16 }}
                            className="grid place-items-center"
                            style={copied ? { color: "var(--net)" } : undefined}
                          >
                            {copied ? (
                              <Check className="size-4" />
                            ) : (
                              <Copy className="size-4" />
                            )}
                          </motion.span>
                        </AnimatePresence>
                      </span>
                    </button>
                  </div>
                </div>

                {/* Footer strip */}
                <div className="dm-hatch dm-in px-5 py-2">
                  <p className="text-foreground/80 text-[13px] leading-relaxed">
                    Send only{" "}
                    <strong className="font-semibold">{token.symbol}</strong> on{" "}
                    <strong className="font-semibold">{network.name}</strong>.
                    Anything else can&rsquo;t be recovered.
                    {minDeposit && (
                      <>
                        {" "}
                        Minimum deposit is {minDeposit} {token.symbol}.
                      </>
                    )}
                    {notice && <> {notice}</>}
                  </p>
                  {secondsLeft != null && (
                    <p className="dm-mono text-muted-foreground mt-1.5 text-xs tabular-nums">
                      {secondsLeft > 0
                        ? `Details expire in ${formatClock(secondsLeft)}`
                        : canRefresh
                          ? "Details expired. Refresh to get a new address."
                          : "Details expired."}
                    </p>
                  )}
                </div>
              </section>
            </div>

            <span role="status" aria-live="polite" className="sr-only">
              {copied ? "Address copied to clipboard" : ""}
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default DepositModal;
