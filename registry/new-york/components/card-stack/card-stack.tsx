"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
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
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    // Skip the staged intro animation when the user prefers reduced motion.
    if (shouldReduceMotion) {
      const skipTimer = setTimeout(() => {
        setOpen(true);
        setIsLoaded(true);
      }, 0);
      return () => clearTimeout(skipTimer);
    }

    let settleTimer: ReturnType<typeof setTimeout>;
    const openTimer = setTimeout(() => {
      setOpen(true);
      settleTimer = setTimeout(() => setIsLoaded(true), settleDelay);
    }, openDelay);

    return () => {
      clearTimeout(openTimer);
      clearTimeout(settleTimer);
    };
  }, [openDelay, settleDelay, shouldReduceMotion]);

  return (
    <section
      className={cn(
        "relative flex h-full min-h-125 w-full items-center justify-center overflow-hidden",
        className,
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
            "border-border bg-card absolute flex h-48 w-48 items-center justify-center rounded-[28px] border-2 shadow-md dark:shadow-2xl",
            cardClassName,
          )}
        >
          <Image
            src={card.image}
            alt={card.name}
            width={96}
            height={96}
            draggable={false}
            className="pointer-events-none h-24 w-24 object-contain"
          />
        </motion.div>
      ))}
    </section>
  );
}
