"use client";

import FolderCard from "@registry/new-york/components/folder-card/folder-card";

export default function FolderCardDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 p-6">
      <FolderCard
        number="01"
        title="Link every chain"
        description="Hold Solana, EVM and more in a single wallet."
        image={{
          src: "/assets/folder-card/solana-wallet.webp",
          alt: "Solana wallet",
        }}
        frameColor="#050826"
        folderColor="#0b1042"
        foreground="#ffffff"
        background="radial-gradient(90% 70% at 15% 5%, #7b6bff 0%, transparent 60%), radial-gradient(80% 60% at 90% 30%, #22c1ff 0%, transparent 55%), linear-gradient(165deg, #3b2ce0 0%, #1b15b0 55%, #0b1042 100%)"
      />
      <FolderCard
        number="02"
        title="Swap in one tap"
        description="Route the best price and confirm with a single signature."
        image={{
          src: "/assets/folder-card/neon-arrow.webp",
          alt: "Neon arrow",
        }}
        frameColor="#020403"
        folderColor="#08140d"
        foreground="#ffffff"
        background="radial-gradient(70% 55% at 75% 10%, #e2ff4a 0%, transparent 55%), radial-gradient(90% 70% at 20% 40%, #1fe06f 0%, transparent 60%), linear-gradient(180deg, #06200f 0%, #020403 100%)"
      />
      <FolderCard
        number="03"
        title="Reward your holders"
        description="Turn every like, mint and share into onchain points."
        image={{
          src: "/assets/folder-card/like-bubble.webp",
          alt: "Like bubble",
        }}
        frameColor="#d8c6ee"
        folderColor="#f1e8fa"
        foreground="#1b1024"
        background="radial-gradient(80% 60% at 20% 10%, #ff9cf5 0%, transparent 60%), radial-gradient(70% 60% at 85% 35%, #8b3dff 0%, transparent 60%), linear-gradient(150deg, #c95cf2 0%, #4b1b7c 100%)"
      />
    </div>
  );
}
