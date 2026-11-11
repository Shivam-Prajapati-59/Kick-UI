"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import RouteTracker, {
  type RouteAsset,
  type RouteSegment,
} from "@registry/new-york/components/route-tracker/route-tracker";

const CG = "https://assets.coingecko.com/coins/images";
const CHAIN = {
  Ethereum: `${CG}/279/large/ethereum.png`,
  Solana: `${CG}/4128/large/solana.png`,
};
const LOGO = {
  ETH: CHAIN.Ethereum,
  USDC: `${CG}/6319/large/USDC.png`,
  SOL: CHAIN.Solana,
};

const asset = (
  symbol: keyof typeof LOGO,
  chain: keyof typeof CHAIN,
): RouteAsset => ({
  symbol,
  chain,
  logo: LOGO[symbol],
  chainLogo: CHAIN[chain],
  native: LOGO[symbol] === CHAIN[chain],
});

// ETH on Ethereum → SOL on Solana: swap into USDC, move it with Circle's
// native burn-and-mint bridge, then swap into SOL.
const SEGMENTS: RouteSegment[] = [
  {
    kind: "swap",
    from: asset("ETH", "Ethereum"),
    to: asset("USDC", "Ethereum"),
    via: "Uniswap",
  },
  {
    kind: "bridge",
    from: asset("USDC", "Ethereum"),
    to: asset("USDC", "Solana"),
    via: "Circle CCTP",
  },
  {
    kind: "swap",
    from: asset("USDC", "Solana"),
    to: asset("SOL", "Solana"),
    via: "Jupiter",
  },
];

// Preview states. "Live" loops through the route; the others pin one state so
// it can be inspected.
const MODES = [
  { id: "live", label: "Live" },
  { id: "progress", label: "In progress", active: 1 },
  { id: "completed", label: "Completed", active: SEGMENTS.length },
  { id: "failed", label: "Failed", active: 2, failed: true },
] as const;

type Mode = (typeof MODES)[number]["id"];

export default function RouteTrackerDemo() {
  const [mode, setMode] = useState<Mode>("live");
  const [step, setStep] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (mode !== "live") return;
    const id = setTimeout(
      () => setStep((a) => (a >= SEGMENTS.length ? 0 : a + 1)),
      step >= SEGMENTS.length ? 3000 : 2200,
    );
    return () => clearTimeout(id);
  }, [mode, step]);

  const current = MODES.find((m) => m.id === mode)!;
  const pick = (id: Mode) => {
    setMode(id);
    if (id === "live") setStep(0);
  };

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <RouteTracker
        segments={SEGMENTS}
        active={"active" in current ? current.active : step}
        failed={"failed" in current}
        eta="~2 min"
        href="https://etherscan.io"
      />
      <div
        role="group"
        aria-label="Preview state"
        className="bg-muted/50 flex h-9 max-w-full items-center gap-0.5 rounded-lg p-1 max-[400px]:w-full"
      >
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            aria-pressed={mode === m.id}
            onClick={() => pick(m.id)}
            className="group focus-visible:ring-ring relative h-7 shrink-0 rounded-md px-3 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2 max-[400px]:flex-auto max-[400px]:px-1.5 max-[400px]:text-xs"
          >
            {mode === m.id && (
              <motion.span
                layoutId="route-tracker-demo-pill"
                transition={
                  reduce
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 420, damping: 34 }
                }
                className="border-border bg-background dark:border-input dark:bg-input/30 absolute inset-0 rounded-md border shadow-sm"
              />
            )}
            <span
              className={
                mode === m.id
                  ? "text-foreground relative"
                  : "text-muted-foreground group-hover:text-foreground relative transition-colors"
              }
            >
              {m.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
