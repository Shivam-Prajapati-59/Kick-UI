import Image from "next/image";

const cards = [
    { name: "Solana", image: "/assets/chains/solana.png", position: "-translate-x-16 -rotate-12 z-10" },
    { name: "Ethereum", image: "/assets/chains/ethereum.png", position: "-rotate-2 z-20" },
    { name: "Bitcoin", image: "/assets/chains/bitcoin.png", position: "translate-x-16 rotate-12 z-30" },
];

export function CardStackStill() {
    return (
        <div className="relative flex size-full items-center justify-center" aria-hidden="true">
            {cards.map((card) => (
                <div
                    key={card.name}
                    className={`absolute flex size-28 items-center justify-center rounded-2xl border-2 border-border bg-card shadow-lg ${card.position}`}
                >
                    <Image src={card.image} alt="" width={48} height={48} />
                </div>
            ))}
        </div>
    );
}