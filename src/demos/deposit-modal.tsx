"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import DepositModal from "@registry/new-york/components/deposit-modal/deposit-modal";

// Wallet icon SVG component
function WalletIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("lucide lucide-wallet", className)}
    >
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
    </svg>
  );
}

// Custom deposit button with wallet icon
function DepositButton({ onClick }: { onClick: () => void }) {
  const reduce = useReducedMotion();

  return (
    <motion.button
      onClick={onClick}
      whileHover={reduce ? undefined : { scale: 1.02 }}
      whileTap={reduce ? undefined : { scale: 0.98 }}
      className={cn(
        "group inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all",
        "bg-primary text-primary-foreground hover:bg-primary/90",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "disabled:pointer-events-none disabled:opacity-50",
        "h-9 px-4 py-2 has-[>svg]:px-3",
        "shrink-0 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 cursor-pointer",
      )}
    >
      <WalletIcon className="size-4" />
      <span>Deposit</span>
    </motion.button>
  );
}

export default function DepositModalDemo() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex w-full justify-center">
      <DepositButton onClick={() => setOpen(true)} />
      <DepositModal
        open={open}
        onOpenChange={setOpen}
        address="4usmCo6FvB7T5jBVSc1rcKRAHAmNgF88MSN7xda5mh"
        amount="125.00"
        amountLabel="Amount to deposit"
        token={{
          symbol: "USDC",
          iconUrl:
            "https://assets.coingecko.com/coins/images/6319/standard/USDC.png",
        }}
        network={{
          name: "Solana",
          iconUrl:
            "https://assets.coingecko.com/coins/images/4128/standard/solana.png",
        }}
        minDeposit="10"
      />
    </div>
  );
}
