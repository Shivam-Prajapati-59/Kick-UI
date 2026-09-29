"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import DepositModal from "@registry/new-york/components/deposit-modal/deposit-modal";

export default function DepositModalDemo() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex w-full justify-center">
      <Button onClick={() => setOpen(true)}>Open deposit modal</Button>
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
