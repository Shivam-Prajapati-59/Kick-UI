"use client";

import React, { useState } from "react";
import { motion, type Variants } from "motion/react";
import { cn } from "@/lib/utils";

export interface Chain {
  id: number;
  name: string;
  symbol: string;
  logo?: string;
}

const defaultChains: Chain[] = [
  { id: 1, name: "Bitcoin", symbol: "BTC", logo: "/assets/chains/bitcoin.png" },
  {
    id: 2,
    name: "Ethereum",
    symbol: "ETH",
    logo: "/assets/chains/ethereum.png",
  },
  { id: 3, name: "BNB Chain", symbol: "BNB", logo: "/assets/chains/bnb.png" },
  { id: 4, name: "Solana", symbol: "SOL", logo: "/assets/chains/solana.png" },
  { id: 5, name: "Polygon", symbol: "POL", logo: "/assets/chains/polygon.png" },
  {
    id: 6,
    name: "Avalanche",
    symbol: "AVAX",
    logo: "/assets/chains/avalanche.png",
  },
  {
    id: 7,
    name: "Arbitrum",
    symbol: "ARB",
    logo: "/assets/chains/arbitrum.png",
  },
  {
    id: 8,
    name: "Optimism",
    symbol: "OP",
    logo: "/assets/chains/optimism.png",
  },
  { id: 9, name: "Base", symbol: "BASE", logo: "/assets/chains/base.png" },
  { id: 10, name: "Sui", symbol: "SUI", logo: "/assets/chains/sui.png" },
  { id: 11, name: "Aptos", symbol: "APT", logo: "/assets/chains/aptos.png" },
  { id: 12, name: "Cosmos", symbol: "ATOM", logo: "/assets/chains/cosmos.png" },
  {
    id: 13,
    name: "Polkadot",
    symbol: "DOT",
    logo: "/assets/chains/polkadot.png",
  },
  {
    id: 14,
    name: "Near Protocol",
    symbol: "NEAR",
    logo: "/assets/chains/near.png",
  },
  { id: 15, name: "Tron", symbol: "TRX", logo: "/assets/chains/tron.png" },
  {
    id: 16,
    name: "Filecoin",
    symbol: "FIL",
    logo: "/assets/chains/filecoin.png",
  },
  {
    id: 17,
    name: "Celestia",
    symbol: "TIA",
    logo: "/assets/chains/celestia.png",
  },
  {
    id: 18,
    name: "Injective",
    symbol: "INJ",
    logo: "/assets/chains/injective.png",
  },
  {
    id: 19,
    name: "Cardano",
    symbol: "ADA",
    logo: "/assets/chains/cardano.png",
  },
  {
    id: 20,
    name: "Toncoin",
    symbol: "TON",
    logo: "/assets/chains/toncoin.png",
  },
  {
    id: 21,
    name: "Starknet",
    symbol: "STRK",
    logo: "/assets/chains/starknet.png",
  },
  { id: 22, name: "zkSync", symbol: "ZK", logo: "/assets/chains/zksync.png" },
  {
    id: 23,
    name: "Internet Computer",
    symbol: "ICP",
    logo: "/assets/chains/icp.png",
  },
  { id: 24, name: "Sei", symbol: "SEI", logo: "/assets/chains/sei.png" },
];

const chainColors: Record<string, string> = {
  BTC: "#f7931a",
  ETH: "#627eea",
  BNB: "#f0b90b",
  SOL: "#9945ff",
  POL: "#8247e5",
  AVAX: "#e84142",
  ARB: "#2d374b",
  OP: "#ff0420",
  BASE: "#0052ff",
  SUI: "#4da2ff",
  APT: "#00bfa5",
  ATOM: "#2e3148",
  DOT: "#e6007a",
  NEAR: "#000000",
  TRX: "#ef0027",
  FIL: "#0090ff",
  TIA: "#7b2fe9",
  INJ: "#00f2fe",
  ADA: "#0033ad",
  TON: "#0098ea",
  STRK: "#08a4d4",
  ZK: "#4c8eff",
  ICP: "#3b00b9",
  SEI: "#8c1c40",
};

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.04 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

function ChainCard({ chain, variants }: { chain: Chain; variants?: Variants }) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <motion.div
      variants={variants}
      whileHover={{ y: -7, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      className="group relative mx-auto h-16 w-16 cursor-pointer md:h-28 md:w-28"
    >
      <div
        className="pointer-events-none absolute inset-x-0 z-10 mx-auto rounded-full bg-[radial-gradient(rgba(0,0,0,0.5)_0%,rgba(0,0,0,0.2)_60%,transparent_80%)] opacity-30 blur-[1px] transition-all duration-300 group-hover:scale-x-110 group-hover:scale-y-150 group-hover:opacity-70 group-hover:blur-[3px] dark:bg-[radial-gradient(rgba(180,180,200,0.25)_0%,rgba(180,180,200,0.08)_60%,transparent_80%)]"
        style={{
          bottom: "0",
          width: "80%",
          height: "10%",
          transform: "translateY(60%)",
        }}
      />

      <div className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden rounded-[1.25rem] border-[0.5px] border-[#f9f6f6] bg-white transition-colors duration-300 dark:border-[#1a1a1f] dark:bg-[#0c0c0e] hover:border-[#f2efef] dark:hover:border-[#2b2b36]">
        {chain.logo && !imgFailed ? (
          <img
            src={chain.logo}
            alt={chain.name}
            loading="lazy"
            className="h-[88%] w-[88%] object-contain"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center rounded-[1.25rem] text-[10px] font-bold text-white md:text-sm"
            style={{ backgroundColor: chainColors[chain.symbol] || "#666" }}
          >
            {chain.symbol}
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface PerspectiveGridProps {
  chains?: Chain[];
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  className?: string;
  gridClassName?: string;
}

export default function PerspectiveGrid({
  chains = defaultChains,
  title = "Any transaction on any chain,<br />Aside executes it for you.",
  subtitle = "Multi-chain ecosystem",
  className,
  gridClassName,
}: PerspectiveGridProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={containerVariants}
      className={cn("relative w-full overflow-hidden py-6", className)}
    >
      <div className="flex w-full flex-col items-center justify-center px-4 md:px-6">
        <motion.div
          variants={itemVariants}
          className="z-10 flex flex-col items-center px-4 text-center"
        >
          <p className="cursor-pointer text-sm font-medium text-primary md:text-[17px]">
            {subtitle} &gt;
          </p>
          <h1 className="text-2xl font-medium leading-[1.1] tracking-tight md:text-[2.5rem]">
            {typeof title === "string"
              ? title.split("<br />").map((part, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <br />}
                    {part}
                  </React.Fragment>
                ))
              : title}
          </h1>
        </motion.div>

        <div
          style={{ perspective: "1000px" }}
          className="w-full max-w-5xl px-4  md:px-8"
        >
          <motion.div
            style={{ rotateX: 45 }}
            variants={containerVariants}
            className={cn(
              "mx-auto grid w-full grid-cols-4 gap-x-4 gap-y-6 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 lg:gap-x-3 lg:gap-y-6",
              gridClassName,
            )}
          >
            {chains.map((chain, i) => (
              <ChainCard key={chain.id} chain={chain} variants={itemVariants} />
            ))}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
