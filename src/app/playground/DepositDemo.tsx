"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import DepositModal from "./DepositModal";

/**
 * Playground-only harness (never part of distribution).
 * Opens the deposit modal from a trigger button.
 */
export default function DepositDemo() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex flex-col items-center gap-6">
      <Button onClick={() => setOpen(true)}>Open deposit modal</Button>
      <DepositModal
        open={open}
        onOpenChange={setOpen}
        address="4usmCo6FvB7T5jBVSc1rcKRAHAmNgF88MSN7xda5mh"
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
        notice={
          <>
            Deposit at least{" "}
            <span className="font-semibold text-foreground">25 USDC</span> on
            Solana to fund both Hyperliquid and Pacifica (~$12.50 each).
          </>
        }
      />
    </div>
  );
}
