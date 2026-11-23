"use client";

import { useState } from "react";
import SwapPanel, {
  type SwapToken,
} from "@registry/new-york/components/swap-panel/swap-panel";

const CG = "https://assets.coingecko.com/coins/images";
const LOGO = {
  SOL: `${CG}/4128/large/solana.png`,
  USDC: `${CG}/6319/large/USDC.png`,
  JUP: `${CG}/34188/large/jup.png`,
  BONK: `${CG}/28600/large/bonk.jpg`,
  ETH: `${CG}/279/large/ethereum.png`,
  USDT: `${CG}/325/large/Tether.png`,
};

// Fake balances and prices, for the preview only.
const TOKENS: SwapToken[] = [
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
    symbol: "ETH",
    name: "Ethereum",
    logo: LOGO.ETH,
    price: 3120.55,
    balance: 0.84,
    decimals: 4,
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

const ACCENT =
  "radial-gradient(80% 120% at 12% 0%, rgba(255,255,255,0.55) 0%, transparent 55%), radial-gradient(90% 130% at 92% 100%, #8b5cf6 0%, transparent 60%), linear-gradient(115deg, #7dd3fc 0%, #93c5fd 30%, #818cf8 65%, #a78bfa 100%)";

export default function SwapPanelDemo() {
  const [tokens, setTokens] = useState<SwapToken[]>(TOKENS);
  return (
    <div className="flex w-full justify-center px-3 py-2">
      <SwapPanel
        tokens={tokens}
        defaultPay="SOL"
        defaultReceive="USDC"
        route={["Orca", "Meteora"]}
        accent={ACCENT}
        refreshInterval={8}
        onRefreshQuote={() =>
          setTokens((prev) =>
            prev.map((token) =>
              token.symbol === "USDC" || token.symbol === "USDT"
                ? token
                : {
                    ...token,
                    price: token.price * (1 + (Math.random() * 0.008 - 0.004)),
                  },
            ),
          )
        }
        onSwap={() =>
          new Promise<void>((resolve) => {
            setTimeout(resolve, 1500);
          })
        }
      />
    </div>
  );
}
