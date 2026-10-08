"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
    animate,
    motion,
    useMotionValue,
    useReducedMotion,
    useTransform,
} from "motion/react";
import { ArrowDown, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Types & default data                                                       */
/* -------------------------------------------------------------------------- */

type SwapSide = "sell" | "buy";

export type SwapChain = { id: string; name: string; logo: string };
export type SwapToken = {
    symbol: string;
    name: string;
    logo: string;
    /** CoinGecko id, used by the default price fetcher. */
    coingeckoId: string;
    /** Chain ids this token is available on. */
    chains: string[];
};
export type PriceMap = Record<string, number>; // coingeckoId -> USD

const TW =
    "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains";

export const DEFAULT_CHAINS: SwapChain[] = [
    { id: "ethereum", name: "Ethereum", logo: `${TW}/ethereum/info/logo.png` },
    { id: "base", name: "Base", logo: `${TW}/base/info/logo.png` },
    { id: "arbitrum", name: "Arbitrum", logo: `${TW}/arbitrum/info/logo.png` },
    { id: "optimism", name: "Optimism", logo: `${TW}/optimism/info/logo.png` },
    { id: "polygon", name: "Polygon", logo: `${TW}/polygon/info/logo.png` },
];

export const DEFAULT_TOKENS: SwapToken[] = [
    {
        symbol: "ETH",
        name: "Ether",
        logo: `${TW}/ethereum/info/logo.png`,
        coingeckoId: "ethereum",
        chains: ["ethereum", "base", "arbitrum", "optimism"],
    },
    {
        symbol: "USDC",
        name: "USD Coin",
        logo: `${TW}/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png`,
        coingeckoId: "usd-coin",
        chains: ["ethereum", "base", "arbitrum", "optimism", "polygon"],
    },
    {
        symbol: "USDT",
        name: "Tether",
        logo: `${TW}/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png`,
        coingeckoId: "tether",
        chains: ["ethereum", "arbitrum", "optimism", "polygon"],
    },
    {
        symbol: "DAI",
        name: "Dai",
        logo: `${TW}/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png`,
        coingeckoId: "dai",
        chains: ["ethereum", "arbitrum", "optimism", "polygon"],
    },
    {
        symbol: "WBTC",
        name: "Wrapped Bitcoin",
        logo: `${TW}/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png`,
        coingeckoId: "wrapped-bitcoin",
        chains: ["ethereum", "arbitrum", "optimism", "polygon"],
    },
    {
        symbol: "POL",
        name: "Polygon",
        logo: `${TW}/polygon/info/logo.png`,
        coingeckoId: "polygon-ecosystem-token",
        chains: ["polygon"],
    },
];

/** Used until (or if) the live fetch fails. */
const FALLBACK_PRICES: PriceMap = {
    ethereum: 3500,
    "usd-coin": 1,
    tether: 1,
    dai: 1,
    "wrapped-bitcoin": 65000,
    "polygon-ecosystem-token": 0.5,
};

/** Default price source: CoinGecko's public, CORS-enabled endpoint. */
async function fetchCoinGeckoPrices(
    ids: string[],
    signal?: AbortSignal,
): Promise<PriceMap> {
    const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(",")}&vs_currencies=usd`,
        { signal },
    );
    if (!res.ok) throw new Error(`Price request failed: ${res.status}`);
    const json = (await res.json()) as Record<string, { usd?: number }>;
    const out: PriceMap = {};
    for (const id of ids) if (json[id]?.usd != null) out[id] = json[id].usd!;
    return out;
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatAmount(n: number): string {
    if (!Number.isFinite(n) || n === 0) return "";
    return n.toFixed(6).replace(/\.?0+$/, "");
}

function formatUsd(n: number): string {
    if (!Number.isFinite(n) || n < 0.005) return "$0";
    return n.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
    });
}

/** Close a popover on outside pointer-down or Escape. */
function useDismiss(
    open: boolean,
    onClose: () => void,
    ref: React.RefObject<HTMLElement | null>,
) {
    useEffect(() => {
        if (!open) return;
        const onPointer = (e: PointerEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) onClose();
        };
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        document.addEventListener("pointerdown", onPointer);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("pointerdown", onPointer);
            document.removeEventListener("keydown", onKey);
        };
    }, [open, onClose, ref]);
}

/* -------------------------------------------------------------------------- */
/*  Small building blocks                                                      */
/* -------------------------------------------------------------------------- */

/** Remote logo with a lettered fallback if the image fails to load. */
function Logo({
    src,
    label,
    size = 24,
}: {
    src: string;
    label: string;
    size?: number;
}) {
    const [failed, setFailed] = useState(false);
    if (failed) {
        return (
            <span
                aria-hidden
                style={{ width: size, height: size }}
                className="bg-muted text-muted-foreground flex shrink-0 items-center justify-center rounded-full text-[10px] font-semibold"
            >
                {label.slice(0, 1)}
            </span>
        );
    }
    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={src}
            alt=""
            width={size}
            height={size}
            loading="lazy"
            onError={() => setFailed(true)}
            className="shrink-0 rounded-full"
        />
    );
}

/** Animated USD "ticker": the number counts to its new value. */
function UsdTicker({ value }: { value: number }) {
    const shouldReduceMotion = useReducedMotion();
    const mv = useMotionValue(value);
    const text = useTransform(mv, formatUsd);

    useEffect(() => {
        if (shouldReduceMotion) {
            mv.set(value);
            return;
        }
        const controls = animate(mv, value, { duration: 0.35, ease: "easeOut" });
        return () => controls.stop();
    }, [value, mv, shouldReduceMotion]);

    return <motion.span className="tabular-nums">{text}</motion.span>;
}

/** Shared dropdown shell. */
function Popover({
    trigger,
    children,
    align = "right",
}: {
    trigger: (p: {
        open: boolean;
        toggle: () => void;
        id: string;
    }) => React.ReactNode;
    children: (close: () => void) => React.ReactNode;
    align?: "left" | "right";
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const id = useId();
    const close = () => setOpen(false);
    useDismiss(open, close, ref);

    return (
        <div ref={ref} className="relative">
            {trigger({ open, toggle: () => setOpen((o) => !o), id })}
            {open && (
                <div
                    id={id}
                    role="listbox"
                    className={cn(
                        "bg-card border-border absolute top-full z-50 mt-2 w-60 rounded-2xl border p-1.5 shadow-lg",
                        align === "right" ? "right-0" : "left-0",
                    )}
                >
                    {children(close)}
                </div>
            )}
        </div>
    );
}

function MenuItem({
    selected,
    disabled,
    onClick,
    children,
}: {
    selected?: boolean;
    disabled?: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            role="option"
            aria-selected={selected}
            disabled={disabled}
            onClick={onClick}
            className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                "focus-visible:ring-ring focus-visible:ring-[3px] focus-visible:outline-none",
                "disabled:pointer-events-none disabled:opacity-40",
            )}
        >
            {children}
            {selected && <Check size={16} className="text-muted-foreground ml-auto" />}
        </button>
    );
}

/* -------------------------------------------------------------------------- */
/*  Main component                                                             */
/* -------------------------------------------------------------------------- */

const SIDES: SwapSide[] = ["sell", "buy"];

// Explicit rows so the swap button can overlap the seam without auto-placement.
const ROW_CLASS: Record<SwapSide, string> = {
    sell: "col-start-1 row-start-1",
    buy: "col-start-1 row-start-2",
};

export type SwapCompProps = {
    chains?: SwapChain[];
    tokens?: SwapToken[];
    /** Override the price source. Receives CoinGecko ids, returns USD prices. */
    fetchPrices?: (ids: string[], signal?: AbortSignal) => Promise<PriceMap>;
    isConnected?: boolean;
    onConnect?: () => void;
    onSwap?: (order: {
        chain: string;
        sell: { symbol: string; amount: string };
        buy: { symbol: string; amount: string };
    }) => void;
};

export default function SwapComp({
    chains = DEFAULT_CHAINS,
    tokens = DEFAULT_TOKENS,
    fetchPrices = fetchCoinGeckoPrices,
    isConnected: connectedProp,
    onConnect,
    onSwap,
}: SwapCompProps) {
    const shouldReduceMotion = useReducedMotion();

    const [chainId, setChainId] = useState(chains[0].id);
    const [active, setActive] = useState<SwapSide>("sell");
    // The typed value always belongs to the active side; the other side is derived.
    const [value, setValue] = useState("");
    const [selected, setSelected] = useState<Record<SwapSide, SwapToken | null>>({
        sell: tokens.find((t) => t.symbol === "ETH") ?? null,
        buy: tokens.find((t) => t.symbol === "USDC") ?? null,
    });
    const [prices, setPrices] = useState<PriceMap>(FALLBACK_PRICES);
    const [localConnected, setLocalConnected] = useState(false);

    const isConnected = connectedProp ?? localConnected;
    const isSellActive = active === "sell";
    const chain = chains.find((c) => c.id === chainId) ?? chains[0];

    // Live prices (falls back to static values on failure).
    useEffect(() => {
        const controller = new AbortController();
        fetchPrices(
            tokens.map((t) => t.coingeckoId),
            controller.signal,
        )
            .then((live) => setPrices((prev) => ({ ...prev, ...live })))
            .catch(() => {
                /* keep fallback prices */
            });
        return () => controller.abort();
    }, [fetchPrices, tokens]);

    const priceOf = (t: SwapToken | null) => (t ? prices[t.coingeckoId] : undefined);

    // Amount for each side: active = typed, other = converted via USD prices.
    const typedNum = parseFloat(value) || 0;
    const activeToken = selected[active];
    const otherSide: SwapSide = isSellActive ? "buy" : "sell";
    const otherToken = selected[otherSide];
    const pActive = priceOf(activeToken);
    const pOther = priceOf(otherToken);
    const derivedNum =
        pActive && pOther && typedNum ? (typedNum * pActive) / pOther : 0;

    const amountOf = (side: SwapSide) =>
        side === active ? value : formatAmount(derivedNum);

    const usdOf = (side: SwapSide) => {
        const price = priceOf(selected[side]);
        const num = side === active ? typedNum : derivedNum;
        return price ? num * price : 0;
    };

    const handleChain = (id: string) => {
        setChainId(id);
        // Drop tokens that don't exist on the new chain.
        setSelected((prev) => ({
            sell: prev.sell?.chains.includes(id) ? prev.sell : null,
            buy: prev.buy?.chains.includes(id) ? prev.buy : null,
        }));
    };

    const handleSwapSides = () => {
        // Keep the numbers consistent: the derived amount becomes the typed one.
        setValue(formatAmount(derivedNum));
        setActive(otherSide);
    };

    // CTA state machine.
    const cta = !isConnected
        ? { label: "Connect wallet", disabled: false }
        : !selected.sell || !selected.buy
            ? { label: "Select a token", disabled: true }
            : typedNum <= 0
                ? { label: "Enter an amount", disabled: true }
                : { label: "Swap", disabled: false };

    const handleCta = () => {
        if (!isConnected) {
            setLocalConnected(true);
            onConnect?.();
            return;
        }
        if (selected.sell && selected.buy) {
            onSwap?.({
                chain: chainId,
                sell: { symbol: selected.sell.symbol, amount: amountOf("sell") },
                buy: { symbol: selected.buy.symbol, amount: amountOf("buy") },
            });
        }
    };

    const renderPanel = (side: SwapSide) => {
        const isActive = active === side;
        const label = side === "sell" ? "Sell" : "Buy";
        const token = selected[side];
        const otherSelected = selected[side === "sell" ? "buy" : "sell"];
        const available = tokens.filter((t) => t.chains.includes(chainId));

        return (
            <div
                key={side}
                className={cn(
                    ROW_CLASS[side],
                    "rounded-[20px] border px-4 py-4 transition-colors",
                    isActive
                        ? "border-border bg-background"
                        : "border-border/60 bg-muted",
                )}
            >
                <span
                    className={cn(
                        "text-sm transition-colors",
                        isActive
                            ? "text-foreground font-medium"
                            : "text-muted-foreground",
                    )}
                >
                    {label}
                </span>

                <div className="mt-2 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <input
                            type="text"
                            inputMode="decimal"
                            placeholder="0"
                            autoComplete="off"
                            value={amountOf(side)}
                            readOnly={!isActive}
                            // Clicking the inactive side makes it the active (typing) side.
                            onFocus={() => {
                                if (!isActive) {
                                    setValue(formatAmount(derivedNum));
                                    setActive(side);
                                }
                            }}
                            onChange={(e) => {
                                const next = e.target.value.replace(",", ".");
                                if (/^\d*\.?\d*$/.test(next)) setValue(next);
                            }}
                            aria-label={`${label} amount`}
                            className="text-foreground placeholder:text-muted-foreground w-full bg-transparent text-[32px] font-medium outline-none"
                        />

                        {/* USD conversion, directly under the input */}
                        <div
                            className={cn(
                                "mt-0.5 text-sm transition-colors",
                                isActive ? "text-foreground/70" : "text-muted-foreground",
                            )}
                        >
                            <UsdTicker value={usdOf(side)} />
                        </div>
                    </div>

                    {/* Token picker: logo + symbol, or "Select token" when empty */}
                    <Popover
                        trigger={({ open, toggle, id }) => (
                            <button
                                type="button"
                                onClick={toggle}
                                aria-haspopup="listbox"
                                aria-expanded={open}
                                aria-controls={id}
                                className={cn(
                                    "flex shrink-0 items-center gap-2 rounded-full py-2 pr-3 text-sm font-semibold transition-colors",
                                    token ? "pl-2" : "pl-4",
                                    "focus-visible:ring-ring focus-visible:ring-[3px] focus-visible:outline-none",
                                    token
                                        ? "border-border bg-card text-foreground hover:bg-accent border"
                                        : isActive
                                            ? "bg-primary text-primary-foreground hover:opacity-90"
                                            : "border-border text-foreground hover:bg-accent hover:text-accent-foreground border",
                                )}
                            >
                                {token && <Logo src={token.logo} label={token.symbol} />}
                                {token ? token.symbol : "Select token"}
                                <ChevronDown size={18} />
                            </button>
                        )}
                    >
                        {(close) =>
                            available.length === 0 ? (
                                <p className="text-muted-foreground px-3 py-2.5 text-sm">
                                    No tokens on {chain.name}
                                </p>
                            ) : (
                                available.map((t) => (
                                    <MenuItem
                                        key={t.symbol}
                                        selected={token?.symbol === t.symbol}
                                        disabled={otherSelected?.symbol === t.symbol}
                                        onClick={() => {
                                            setSelected((prev) => ({ ...prev, [side]: t }));
                                            close();
                                        }}
                                    >
                                        <Logo src={t.logo} label={t.symbol} size={28} />
                                        <span className="flex flex-col leading-tight">
                                            <span className="font-medium">{t.symbol}</span>
                                            <span className="text-muted-foreground text-xs">
                                                {t.name}
                                            </span>
                                        </span>
                                    </MenuItem>
                                ))
                            )
                        }
                    </Popover>
                </div>
            </div>
        );
    };

    return (
        <div className="text-card-foreground bg-card w-[480px] rounded-[24px] p-2">
            {/* Header: title + chain selector */}
            <div className="flex items-center justify-between px-2 pt-1 pb-3">
                <span className="text-base font-semibold">Swap</span>

                <Popover
                    trigger={({ open, toggle, id }) => (
                        <button
                            type="button"
                            onClick={toggle}
                            aria-haspopup="listbox"
                            aria-expanded={open}
                            aria-controls={id}
                            className={cn(
                                "border-border bg-card hover:bg-accent flex items-center gap-2 rounded-full border py-1.5 pr-3 pl-2 text-sm font-medium transition-colors",
                                "focus-visible:ring-ring focus-visible:ring-[3px] focus-visible:outline-none",
                            )}
                        >
                            <Logo src={chain.logo} label={chain.name} size={20} />
                            {chain.name}
                            <ChevronDown size={16} />
                        </button>
                    )}
                >
                    {(close) =>
                        chains.map((c) => (
                            <MenuItem
                                key={c.id}
                                selected={c.id === chainId}
                                onClick={() => {
                                    handleChain(c.id);
                                    close();
                                }}
                            >
                                <Logo src={c.logo} label={c.name} size={24} />
                                {c.name}
                            </MenuItem>
                        ))
                    }
                </Popover>
            </div>

            <div className="grid grid-cols-1 gap-2">
                {SIDES.map(renderPanel)}

                {/* Swap button, centred on the seam between the two panels */}
                <div className="pointer-events-none col-start-1 row-span-2 row-start-1 flex justify-center self-center">
                    <motion.button
                        type="button"
                        onClick={handleSwapSides}
                        aria-label={isSellActive ? "Swap to buy" : "Swap to sell"}
                        whileTap={shouldReduceMotion ? undefined : { scale: 0.92 }}
                        className={cn(
                            "bg-card border-border text-foreground pointer-events-auto",
                            "flex h-11 w-11 items-center justify-center rounded-[14px] border shadow-sm",
                            "focus-visible:ring-ring focus-visible:ring-[3px] focus-visible:outline-none",
                        )}
                    >
                        <motion.span
                            animate={{ rotate: isSellActive ? 0 : 180 }}
                            transition={
                                shouldReduceMotion
                                    ? { duration: 0 }
                                    : { type: "spring", stiffness: 380, damping: 28 }
                            }
                            className="flex"
                        >
                            <ArrowDown size={21} />
                        </motion.span>
                    </motion.button>
                </div>

                {/* CTA */}
                <button
                    type="button"
                    onClick={handleCta}
                    disabled={cta.disabled}
                    className={cn(
                        "col-start-1 row-start-3 w-full rounded-[18px] py-4 text-base font-semibold transition-colors",
                        "focus-visible:ring-ring focus-visible:ring-[3px] focus-visible:outline-none",
                        "disabled:pointer-events-none disabled:opacity-60",
                        isConnected && !cta.disabled
                            ? "bg-primary text-primary-foreground hover:opacity-90"
                            : "bg-primary/10 text-primary hover:bg-primary/20",
                    )}
                >
                    {cta.label}
                </button>
            </div>
        </div>
    );
}