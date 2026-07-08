"use client";

import React from "react";
import { motion, Variants } from "motion/react";
import { cn } from "@/lib/utils";
import { AnimatedList } from "@/components/ui/animated-list";

export type CryptoListItem = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  price: number;
  marketCap: string;
  change24h: number;
};

export const AnimatedListItems: CryptoListItem[] = [
  {
    id: "bitcoin",
    symbol: "BTC",
    name: "Bitcoin",
    image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
    price: 63442.19,
    marketCap: "$1.27T",
    change24h: 2.94,
  },
  {
    id: "ethereum",
    symbol: "ETH",
    name: "Ethereum",
    image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
    price: 3524.18,
    marketCap: "$424.5B",
    change24h: 1.87,
  },
  {
    id: "solana",
    symbol: "SOL",
    name: "Solana",
    image: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
    price: 182.63,
    marketCap: "$85.1B",
    change24h: 4.32,
  },
  {
    id: "binancecoin",
    symbol: "BNB",
    name: "BNB",
    image:
      "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png",
    price: 612.48,
    marketCap: "$89.3B",
    change24h: 1.54,
  },
  {
    id: "ripple",
    symbol: "XRP",
    name: "XRP",
    image:
      "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png",
    price: 0.64,
    marketCap: "$37.8B",
    change24h: -0.92,
  },
  {
    id: "cardano",
    symbol: "ADA",
    name: "Cardano",
    image: "https://assets.coingecko.com/coins/images/975/large/cardano.png",
    price: 0.72,
    marketCap: "$25.5B",
    change24h: 3.18,
  },
  {
    id: "dogecoin",
    symbol: "DOGE",
    name: "Dogecoin",
    image: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png",
    price: 0.18,
    marketCap: "$27.3B",
    change24h: 5.11,
  },
  {
    id: "tron",
    symbol: "TRX",
    name: "TRON",
    image: "https://assets.coingecko.com/coins/images/1094/large/tron-logo.png",
    price: 0.13,
    marketCap: "$11.6B",
    change24h: 0.84,
  },
  {
    id: "avalanche-2",
    symbol: "AVAX",
    name: "Avalanche",
    image:
      "https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png",
    price: 38.41,
    marketCap: "$15.7B",
    change24h: 2.41,
  },
  {
    id: "chainlink",
    symbol: "LINK",
    name: "Chainlink",
    image:
      "https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png",
    price: 16.82,
    marketCap: "$10.9B",
    change24h: 2.15,
  },
  {
    id: "polkadot",
    symbol: "DOT",
    name: "Polkadot",
    image: "https://assets.coingecko.com/coins/images/12171/large/polkadot.png",
    price: 6.84,
    marketCap: "$9.8B",
    change24h: -1.24,
  },
  {
    id: "polygon",
    symbol: "POL",
    name: "Polygon",
    image: "https://assets.coingecko.com/coins/images/4713/large/polygon.png",
    price: 0.71,
    marketCap: "$7.2B",
    change24h: 1.12,
  },
  {
    id: "near",
    symbol: "NEAR",
    name: "NEAR Protocol",
    image: "https://assets.coingecko.com/coins/images/10365/large/near.jpg",
    price: 5.32,
    marketCap: "$6.4B",
    change24h: 3.94,
  },
  {
    id: "litecoin",
    symbol: "LTC",
    name: "Litecoin",
    image: "https://assets.coingecko.com/coins/images/2/large/litecoin.png",
    price: 84.76,
    marketCap: "$6.3B",
    change24h: 1.08,
  },
  {
    id: "uniswap",
    symbol: "UNI",
    name: "Uniswap",
    image:
      "https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png",
    price: 9.87,
    marketCap: "$5.9B",
    change24h: 4.56,
  },
];

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.5,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

const CryptoCard = ({
  coin,
  index,
  isSelected,
  onMouseEnter,
  onClick,
  listRef,
}: {
  coin: CryptoListItem;
  index: number;
  isSelected: boolean;
  onMouseEnter: () => void;
  onClick: () => void;
  listRef: React.RefObject<HTMLDivElement | null>;
}) => {
  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.2, root: listRef }}
      className={cn(
        "flex items-center justify-between p-4 mb-2 rounded-lg shadow-sm border border-border cursor-pointer transition-colors",
        isSelected ? "bg-accent" : "bg-card hover:bg-accent/50",
      )}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      data-index={index}
    >
      <div className="flex items-center gap-4">
        <img
          src={coin.image}
          alt={coin.name}
          className="w-10 h-10 object-contain"
        />
        <div>
          <h3 className="font-semibold">{coin.name}</h3>
          <p className="text-sm text-muted-foreground">{coin.symbol}</p>
        </div>
      </div>
      <div className="text-right">
        <div className="font-medium">${coin.price.toLocaleString()}</div>
        <div
          className={cn(
            "text-sm",
            coin.change24h >= 0 ? "text-green-500" : "text-red-500",
          )}
        >
          {coin.change24h > 0 ? "+" : ""}
          {coin.change24h}%
        </div>
      </div>
    </motion.div>
  );
};

const AnimatedListDemo = () => {
  return (
    <AnimatedList
      items={AnimatedListItems}
      renderItem={(
        item: CryptoListItem,
        index: number,
        isSelected: boolean,
        onMouseEnter: () => void,
        onClick: () => void,
        listRef: React.RefObject<HTMLDivElement | null>,
      ) => (
        <CryptoCard
          coin={item}
          index={index}
          isSelected={isSelected}
          onMouseEnter={onMouseEnter}
          onClick={onClick}
          listRef={listRef}
        />
      )}
    />
  );
};

export default AnimatedListDemo;
