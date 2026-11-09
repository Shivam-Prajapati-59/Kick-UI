"use client";
import WalletCard from "@registry/new-york/components/wallet-card/wallet-card";

// USD value over the past 24h; the last entry is the current balance.
const HISTORY = [
  17760, 17810, 17930, 17880, 18020, 18110, 18060, 18190, 18150, 18270, 18210,
  18300, 18240.35,
];

export default function WalletCardDemo() {
  return (
    <WalletCard
      label="Main wallet"
      chain="Base"
      logo="/assets/chains/base-logo.png"
      address="0x4f2a9b7c1d3e5f60718293a4b5c6d7e8f901c91e"
      rewards={1521.32}
      history={HISTORY}
    />
  );
}
