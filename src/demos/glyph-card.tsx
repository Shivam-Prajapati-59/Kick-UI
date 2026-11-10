"use client";

import GlyphCard from "@registry/new-york/components/glyph-card/glyph-card";

export default function GlyphCardDemo() {
  return (
    <GlyphCard
      chain="Ethereum"
      logo="https://assets.coingecko.com/coins/images/279/large/ethereum.png"
      address="0xB8d54f2a9b7c1d3e5f60718293a4b5c6d7e8563B"
      balance={1248.5}
      token={{
        symbol: "USDC",
        amount: 1248.5,
        value: 1248.5,
        logo: "https://assets.coingecko.com/coins/images/6319/standard/USDC.png",
      }}
      onAdd={() => {}}
    />
  );
}
