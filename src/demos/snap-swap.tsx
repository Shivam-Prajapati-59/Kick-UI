"use client";

import { useEffect, useState } from "react";
import SnapSwap, {
  type SnapSwapToken,
} from "@registry/new-york/components/snap-swap/snap-swap";
import {
  fetchJupiterPrices,
  fetchJupiterQuote,
} from "@registry/new-york/components/snap-swap/jupiter-feed";

const CG = "https://assets.coingecko.com/coins/images";
const LOGO = {
  SOL: `${CG}/4128/large/solana.png`,
  USDC: `${CG}/6319/large/USDC.png`,
  JUP: `${CG}/34188/large/jup.png`,
  BONK: `${CG}/28600/large/bonk.jpg`,
  USDT: `${CG}/325/large/Tether.png`,
};

// Fake balances, for the preview only.
const TOKENS: SnapSwapToken[] = [
  {
    symbol: "SOL",
    name: "Solana",
    logo: LOGO.SOL,
    price: 142.31,
    balance: 12.4,
    decimals: 4,
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    logo: LOGO.USDC,
    price: 1,
    balance: 2480.5,
    decimals: 2,
  },
  {
    symbol: "JUP",
    name: "Jupiter",
    logo: LOGO.JUP,
    price: 0.82,
    balance: 1640,
    decimals: 2,
  },
  {
    symbol: "BONK",
    name: "Bonk",
    logo: LOGO.BONK,
    price: 0.0000234,
    balance: 4_200_000,
    decimals: 0,
  },
  {
    symbol: "USDT",
    name: "Tether",
    logo: LOGO.USDT,
    price: 1,
    balance: 512.75,
    decimals: 2,
  },
];

export default function SnapSwapDemo() {
  const [tokens, setTokens] = useState(TOKENS);
  // Hold the first render briefly for real prices, so the rate does not
  // jump from the static fallback while the card snaps in.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let inFlight = false;
    let activeController: AbortController | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const fallback = setTimeout(() => setReady(true), 1500);

    const load = () => {
      if (inFlight) return;
      inFlight = true;
      const controller = new AbortController();
      activeController = controller;
      timer = setTimeout(() => controller.abort(), 8000);
      fetchJupiterPrices(
        TOKENS.map((t) => t.symbol),
        controller.signal,
      )
        .then((prices) => {
          if (cancelled) return;
          setTokens((prev) =>
            prev.map((t) => ({
              ...t,
              price: prices[t.symbol] ?? t.price,
            })),
          );
        })
        .catch(() => {
          // keep static prices silently
        })
        .finally(() => {
          if (timer) {
            clearTimeout(timer);
            timer = null;
          }
          inFlight = false;
          activeController = null;
          if (!cancelled) setReady(true);
        });
    };

    load();
    const id = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, 30000);
    return () => {
      cancelled = true;
      activeController?.abort();
      clearInterval(id);
      if (timer) clearTimeout(timer);
      clearTimeout(fallback);
    };
  }, []);

  return (
    <div className="flex w-full justify-center px-3 py-2">
      {ready && (
        <SnapSwap
          tokens={tokens}
          getQuote={fetchJupiterQuote}
          quoteSource="Jupiter"
        />
      )}
    </div>
  );
}
