import Image from "next/image";

const chains = [
  { name: "Ethereum", image: "/assets/chains/ethereum.png" },
  { name: "Solana", image: "/assets/chains/solana.png" },
  { name: "Bitcoin", image: "/assets/chains/bitcoin.png" },
  { name: "Polygon", image: "/assets/chains/polygon.png" },
  { name: "Arbitrum", image: "/assets/chains/arbitrum.png" },
  { name: "Base", image: "/assets/chains/base.png" },
  { name: "BNB", image: "/assets/chains/bnb.png" },
  { name: "Avalanche", image: "/assets/chains/avalanche.png" },
];

export function PerspectiveGridStill() {
  return (
    <div className="flex size-full flex-col items-center justify-center gap-2 overflow-hidden px-4" aria-hidden="true">
      <p className="text-muted-foreground text-[11px] font-medium">Any chain. One interface.</p>
      <div
        className="grid grid-cols-4 gap-2"
        style={{ transform: "perspective(420px) rotateX(24deg)" }}
      >
        {chains.map((chain) => (
          <div
            key={chain.name}
            className="border-border bg-secondary flex size-11 items-center justify-center rounded-lg border shadow-sm"
          >
            <Image src={chain.image} alt="" width={24} height={24} className="size-6 object-contain" />
          </div>
        ))}
      </div>
    </div>
  );
}
