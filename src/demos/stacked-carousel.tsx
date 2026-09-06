"use client";

import Image from "next/image";
import { ChevronRight, LoaderCircle, RefreshCw, SendHorizonalIcon } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { StackedCarousel } from "@registry/new-york/components/stacked-carousel/stacked-carousel";

export interface TransactionItemData {
  id: string | number;
  icon?: string | ReactNode;
  type?: "sending" | "swapping";
  recipient?: string;
  crypto?: string;
  amount?: string;
  from?: string;
  to?: string;
  received?: string;
  label?: string;
  title?: ReactNode;
  subValue?: string;
  value?: ReactNode;
  className?: string;
}

export const Spinner = () => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ duration: 0.9, ease: "linear", repeat: Infinity }}
  >
    <LoaderCircle className="h-3.5 w-3.5 text-white text-center" strokeWidth={3} />
  </motion.div>
);

export function resolveIcon(icon: TransactionItemData["icon"]) {
  if (typeof icon === "string") {
    return (
      <Image
        src={icon}
        alt=""
        width={44}
        height={44}
        className="h-11 w-11 object-contain"
      />
    );
  }
  return icon;
}

export const TokenPair = ({ icon }: { icon: TransactionItemData["icon"] }) => (
  <div className="relative h-12 w-12 shrink-0">
    <span className="absolute left-0 top-0 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-[#4DAFFF] shadow-sm">
      <Spinner />
    </span>
    <span className="absolute bottom-0 right-0 flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-background bg-muted shadow-sm">
      {resolveIcon(icon)}
    </span>
  </div>
);

export const getVariant = (item: TransactionItemData): "sending" | "swapping" =>
  item.type ?? (item.from && item.to ? "swapping" : "sending");

export const TransactionItemContent = ({ item }: { item: TransactionItemData }) => {
  const variant = getVariant(item);
  const isSending = variant === "sending";

  return (
    <>
      <div className="flex min-w-0 items-center gap-3 max-w-[420px]">
        <TokenPair icon={item.icon} />
        <div className="min-w-0 leading-tight">
          {item.title ?? (isSending ? (
            <>
              <p className="mb-1 flex items-center gap-1 whitespace-nowrap text-sm font-medium text-muted-foreground">
                <SendHorizonalIcon className="text-primary pb-1" size={19} />
                {item.label ?? (
                  <>Sending to <span className="font-semibold text-foreground">{item.recipient}</span></>
                )}
              </p>
              <p className="text-xl font-bold tracking-tight text-foreground">{item.crypto}</p>
            </>
          ) : (
            <>
              <p className="mb-1 flex items-center gap-1 text-sm font-medium text-muted-foreground">
                <RefreshCw className="text-primary pb-1" size={19} />
                {item.label ?? "Swapping"}
              </p>
              <div className="flex items-center gap-1 text-base font-bold text-foreground">
                <span>{item.from}</span>
                <ChevronRight className="text-muted-foreground pb-1" size={20} />
                <span>{item.to}</span>
              </div>
            </>
          ))}
        </div>
      </div>

      <div className="shrink-0 text-right leading-tight">
        <p className={`mb-1 text-lg font-semibold text-muted-foreground ${isSending ? "opacity-0" : ""}`}>
          {item.subValue ?? item.amount}
        </p>
        {item.value ?? (isSending ? (
          <p className="text-xl font-semibold tracking-tight text-foreground">{item.amount}</p>
        ) : (
          <p className="text-base font-semibold text-success">{item.received}</p>
        ))}
      </div>
    </>
  );
};

export const defaultTransactionItems: TransactionItemData[] = [
  {
    id: 1,
    type: "sending",
    icon: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png",
    recipient: "Naru Paswan",
    crypto: "Ethereum",
    amount: "20.00 ETH",
  },
  {
    id: 2,
    type: "swapping",
    icon: "https://assets.coingecko.com/coins/images/6319/standard/USDC.png",
    from: "ETH",
    to: "USDC",
    amount: "0.50 ETH",
    received: "~ 1000 USDC",
  },
  {
    id: 3,
    type: "sending",
    icon: "https://assets.coingecko.com/coins/images/4128/standard/solana.png",
    recipient: "Alex Mishra",
    crypto: "Solana",
    amount: "12.50 Sol",
  },
];

const StackedCarouselDemo = () => (
  <StackedCarousel
    items={defaultTransactionItems}
    renderItem={(item: TransactionItemData) => (
      <TransactionItemContent item={item} />
    )}
  />
);

export default StackedCarouselDemo;
