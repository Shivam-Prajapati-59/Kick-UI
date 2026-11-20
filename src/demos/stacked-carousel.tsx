"use client";

import Image from "next/image";
import {
  ChevronRight,
  LoaderCircle,
  RefreshCw,
  SendHorizonalIcon,
} from "lucide-react";
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
    <LoaderCircle
      className="h-3.5 w-3.5 text-center text-white"
      strokeWidth={3}
    />
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
        className="h-full w-full object-contain"
      />
    );
  }
  return icon;
}

export const TokenPair = ({ icon }: { icon: TransactionItemData["icon"] }) => (
  <div className="relative h-12 w-12 shrink-0">
    <span className="absolute top-0 left-0 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-[#4DAFFF] shadow-sm">
      <Spinner />
    </span>
    <span className="border-background bg-muted absolute right-0 bottom-0 flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 shadow-sm">
      {resolveIcon(icon)}
    </span>
  </div>
);

export const getVariant = (item: TransactionItemData): "sending" | "swapping" =>
  item.type ?? (item.from && item.to ? "swapping" : "sending");

export const TransactionItemContent = ({
  item,
}: {
  item: TransactionItemData;
}) => {
  const variant = getVariant(item);
  const isSending = variant === "sending";

  return (
    <>
      <div className="flex max-w-[420px] min-w-0 items-center gap-3">
        <TokenPair icon={item.icon} />
        <div className="min-w-0 leading-tight">
          {item.title ??
            (isSending ? (
              <>
                <p className="text-muted-foreground mb-1 flex items-center gap-1 text-sm font-medium whitespace-nowrap">
                  <SendHorizonalIcon className="text-primary pb-1" size={19} />
                  {item.label ?? (
                    <>
                      Sending to{" "}
                      <span className="text-foreground font-semibold">
                        {item.recipient}
                      </span>
                    </>
                  )}
                </p>
                <p className="text-foreground text-xl font-bold tracking-tight">
                  {item.crypto}
                </p>
              </>
            ) : (
              <>
                <p className="text-muted-foreground mb-1 flex items-center gap-1 text-sm font-medium">
                  <RefreshCw className="text-primary pb-1" size={19} />
                  {item.label ?? "Swapping"}
                </p>
                <div className="text-foreground flex items-center gap-1 text-base font-bold">
                  <span>{item.from}</span>
                  <ChevronRight
                    className="text-muted-foreground pb-1"
                    size={20}
                  />
                  <span>{item.to}</span>
                </div>
              </>
            ))}
        </div>
      </div>

      <div className="shrink-0 text-right leading-tight">
        <p
          className={`text-muted-foreground mb-1 text-lg font-semibold ${isSending ? "opacity-0" : ""}`}
        >
          {item.subValue ?? item.amount}
        </p>
        {item.value ??
          (isSending ? (
            <p className="text-foreground text-xl font-semibold tracking-tight">
              {item.amount}
            </p>
          ) : (
            <p className="text-success text-base font-semibold">
              {item.received}
            </p>
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
