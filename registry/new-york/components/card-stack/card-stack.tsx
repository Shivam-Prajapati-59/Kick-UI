"use client";

import { useEffect, useState } from "react";
import { motion, type Variants } from "motion/react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface CardItem {
  id: string | number;
  name: string;
  image: string;
  position: { x: number; y: number; rotate: number };
}

export const cryptoCards: CardItem[] = [
  {
    id: 1,
    name: "USDT",
    image: "https://assets.coingecko.com/coins/images/325/large/Tether.png",
    position: { x: -300, y: 12, rotate: -10 },
  },
  {
    id: 2,
    name: "BNB",
    image:
      "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png",
    position: { x: -180, y: -20, rotate: -6 },
  },
  {
    id: 3,
    name: "USDC",
    image: "https://assets.coingecko.com/coins/images/6319/large/usdc.png",
    position: { x: -60, y: 0, rotate: -2 },
  },
  {
    id: 4,
    name: "Solana",
    image: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
    position: { x: 60, y: 0, rotate: 2 },
  },
  {
    id: 5,
    name: "Ethereum",
    image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
    position: { x: 180, y: 4, rotate: 6 },
  },
  {
    id: 6,
    name: "Bitcoin",
    image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
    position: { x: 300, y: -5, rotate: 10 },
  },
];

// Hoisted so these aren't reallocated on every render/every card
const CARD_VARIANTS: Variants = {
  hidden: { x: 30, y: 100, rotate: -30, scale: 0.6, opacity: 0 },
  stacked: { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 },
  fanned: ({ x, y, rotate }: { x: number; y: number; rotate: number }) => ({
    x,
    y,
    rotate,
    scale: 1,
    opacity: 1,
  }),
};

export interface CardStackProps {
  items?: CardItem[];
  openDelay?: number;
  settleDelay?: number;
  hoverOffset?: number;
  className?: string;
  cardClassName?: string;
}

export default function CardStack({
  items = cryptoCards,
  openDelay = 600,
  settleDelay = 500,
  hoverOffset = -20,
  className,
  cardClassName,
}: CardStackProps) {
  const [open, setOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const openTimer = setTimeout(() => {
      setOpen(true);
      const settleTimer = setTimeout(() => setIsLoaded(true), settleDelay);
      return () => clearTimeout(settleTimer);
    }, openDelay);

    return () => clearTimeout(openTimer);
  }, [openDelay, settleDelay]);

  return (
    <section
      className={cn(
        "relative flex items-center justify-center h-full min-h-[500px] w-full overflow-hidden",
        className
      )}
    >
      {items.map((card, index) => (
        <motion.div
          key={card.id}
          custom={card.position}
          variants={CARD_VARIANTS}
          initial="hidden"
          animate={open ? "fanned" : "stacked"}
          whileHover={{ y: hoverOffset, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 170,
            damping: 18,
            delay: isLoaded ? 0 : 0.1,
          }}
          style={{ zIndex: index }}
          className={cn(
            "absolute w-48 h-48 rounded-[28px] border-2 dark:border-[#423546] border-[#d1c8d5] bg-card shadow-md dark:shadow-2xl flex items-center justify-center",
            cardClassName
          )}
        >
          <Image
            src={card.image}
            alt={card.name}
            width={96}
            height={96}
            draggable={false}
            className="w-24 h-24 object-contain pointer-events-none"
          />
        </motion.div>
      ))}
    </section>
  );
}
