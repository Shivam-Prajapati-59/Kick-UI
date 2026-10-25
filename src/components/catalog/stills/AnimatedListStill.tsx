import Image from "next/image";

const coins = [
    { name: "Bitcoin", symbol: "BTC", image: "/assets/chains/bitcoin.png", price: "$63,442", change: "+2.94%" },
    { name: "Ethereum", symbol: "ETH", image: "/assets/chains/ethereum.png", price: "$3,524", change: "+1.87%" },
    { name: "Solana", symbol: "SOL", image: "/assets/chains/solana.png", price: "$182", change: "+4.32%" },
];

export function AnimatedListStill() {
    return (
        <div className="flex size-full items-center justify-center px-4 py-3" aria-hidden="true">
            <div className="w-full max-w-[300px] space-y-2">
                {coins.map((coin, index) => (
                    <div
                        key={coin.symbol}
                        className={`flex items-center gap-2 rounded-lg border border-border px-2 py-1.5 ${index === 1 ? "bg-accent" : "bg-card"
                            }`}
                    >
                        <Image src={coin.image} alt="" width={28} height={28} />
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold text-foreground">{coin.name}</p>
                            <p className="text-[11px] text-muted-foreground">{coin.symbol}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-medium text-foreground">{coin.price}</p>
                            <p className="text-[11px] text-green-500">{coin.change}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}