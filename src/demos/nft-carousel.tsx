"use client";

import NftCarousel, {
  type NftCarouselItem,
} from "@registry/new-york/components/nft-carousel/nft-carousel";

// Live pump.fun coin art, hotlinked from DexScreener's CDN (not bundled).
// Market caps and 24h moves are a DexScreener snapshot from 2026-11-18.
const cdn = (id: string) =>
  `https://cdn.dexscreener.com/cms/images/${id}?width=800&height=800&quality=95&format=auto`;

const DROPS: NftCarouselItem[] = [
  {
    image: cdn("mQP7sAoAr5djNbZY"),
    name: "Macca The Gator",
    ticker: "$MACCA",
    creator: "CA AKot…pump",
    description: "A pink gator in a beach shirt, sunglasses and a martini.",
    stat: "-1.8% · 24h",
    marketCap: "$1.9M",
    progress: 100,
    background: "#1b1b2e",
  },
  {
    image: cdn(
      "14201087ebafd2b8ca5c3242ddfd4e6cb0824b539ad0736ebea5ec03edefd214",
    ),
    name: "Act I: The AI Prophecy",
    ticker: "$ACT",
    creator: "CA GJAF…pump",
    description: "An anime eye lit violet, the face of an AI-agent meme.",
    stat: "+3.0% · 24h",
    marketCap: "$8.5M",
    progress: 100,
    background: "#e6d6f2",
  },
  {
    image: cdn(
      "778498984ea5b6eb7c9d74e1e81a2547c88a41ae80f6c840c94a7c3b7829bcd5",
    ),
    name: "Peanut the Squirrel",
    ticker: "$PNUT",
    creator: "CA 2qEH…pump",
    description: "A cowboy-hat squirrel that became one of Solana's top memes.",
    stat: "-1.6% · 24h",
    marketCap: "$30.1M",
    progress: 100,
    background: "#bfdcf2",
  },
  {
    image: cdn("BFrtXt796DJWyUst"),
    name: "BLOB",
    ticker: "$BLOB",
    creator: "CA 8s11…pump",
    description:
      "A soft orange blob chewing on a plug. That is the whole lore.",
    stat: "-81.4% · 24h",
    marketCap: "$2.3M",
    progress: 100,
    background: "#f6efe3",
  },
  {
    image: cdn("-rb26rb99MApo8cB"),
    name: ":3",
    ticker: "$:3",
    creator: "CA FSky…pump",
    description: "One cat, very close to the camera, saying :3.",
    stat: "+89.5% · 24h",
    marketCap: "$868K",
    progress: 100,
    background: "#e9e4df",
  },
  {
    image: cdn("CN2GXn9xCwxqB6AH"),
    name: "ni hao cat",
    ticker: "$MIHAO",
    creator: "CA 4Cxj…pump",
    description: "A ginger cat with a long white moustache, saying ni hao.",
    stat: "-21.1% · 24h",
    marketCap: "$7.9M",
    progress: 100,
    background: "#3a3530",
  },
];

export default function NftCarouselDemo() {
  return (
    <div className="flex h-[560px] w-full items-center justify-center sm:h-[680px]">
      <NftCarousel items={DROPS} initialIndex={2} />
    </div>
  );
}
