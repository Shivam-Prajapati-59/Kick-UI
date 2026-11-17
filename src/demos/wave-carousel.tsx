"use client";

import WaveCarousel, {
  type WaveCarouselItem,
} from "@registry/new-york/components/wave-carousel/wave-carousel";

const DROPS: WaveCarouselItem[] = [
  {
    image: "/assets/nfts/noun-7.svg",
    title: "Noun #7",
    fit: "cover",
    background: "#ffb3c7",
    href: "#",
    pixelated: true,
  },
  {
    image: "/assets/nfts/noun-12.svg",
    title: "Noun #12",
    fit: "cover",
    background: "#ffd28a",
    href: "#",
    pixelated: true,
  },
  {
    image: "/assets/nfts/noun-23.svg",
    title: "Noun #23",
    fit: "cover",
    background: "#b8f2a6",
    href: "#",
    pixelated: true,
  },
  {
    image: "/assets/nfts/noun-41.svg",
    title: "Noun #41",
    fit: "cover",
    background: "#9ee7ff",
    href: "#",
    pixelated: true,
  },
  {
    image: "/assets/nfts/noun-58.svg",
    title: "Noun #58",
    fit: "cover",
    background: "#c6b6ff",
    href: "#",
    pixelated: true,
  },
  {
    image: "/assets/nfts/noun-77.svg",
    title: "Noun #77",
    fit: "cover",
    background: "#ffa98f",
    href: "#",
    pixelated: true,
  },
  {
    image: "/assets/nfts/noun-96.svg",
    title: "Noun #96",
    fit: "cover",
    background: "#8ff0d6",
    href: "#",
    pixelated: true,
  },
  {
    image: "/assets/nfts/noun-118.svg",
    title: "Noun #118",
    fit: "cover",
    background: "#f7f08a",
    href: "#",
    pixelated: true,
  },
  {
    image: "/assets/nfts/noun-142.svg",
    title: "Noun #142",
    fit: "cover",
    background: "#ffb3c7",
    href: "#",
    pixelated: true,
  },
  {
    image: "/assets/nfts/noun-177.svg",
    title: "Noun #177",
    fit: "cover",
    background: "#ffd28a",
    href: "#",
    pixelated: true,
  },
  {
    image: "/assets/nfts/noun-203.svg",
    title: "Noun #203",
    fit: "cover",
    background: "#b8f2a6",
    href: "#",
    pixelated: true,
  },
  {
    image: "/assets/nfts/noun-256.svg",
    title: "Noun #256",
    fit: "cover",
    background: "#9ee7ff",
    href: "#",
    pixelated: true,
  },
  {
    image: "/assets/nfts/noun-311.svg",
    title: "Noun #311",
    fit: "cover",
    background: "#c6b6ff",
    href: "#",
    pixelated: true,
  },
  {
    image: "/assets/nfts/noun-369.svg",
    title: "Noun #369",
    fit: "cover",
    background: "#ffa98f",
    href: "#",
    pixelated: true,
  },
  {
    image: "/assets/nfts/noun-420.svg",
    title: "Noun #420",
    fit: "cover",
    background: "#8ff0d6",
    href: "#",
    pixelated: true,
  },
  {
    image: "/assets/nfts/noun-488.svg",
    title: "Noun #488",
    fit: "cover",
    background: "#f7f08a",
    href: "#",
    pixelated: true,
  },
  {
    image: "/assets/nfts/noun-555.svg",
    title: "Noun #555",
    fit: "cover",
    background: "#ffb3c7",
    href: "#",
    pixelated: true,
  },
  {
    image: "/assets/nfts/noun-640.svg",
    title: "Noun #640",
    fit: "cover",
    background: "#ffd28a",
    href: "#",
    pixelated: true,
  },
  {
    image: "/assets/nfts/noun-777.svg",
    title: "Noun #777",
    fit: "cover",
    background: "#b8f2a6",
    href: "#",
    pixelated: true,
  },
  {
    image: "/assets/nfts/noun-901.svg",
    title: "Noun #901",
    fit: "cover",
    background: "#9ee7ff",
    href: "#",
    pixelated: true,
  },
];

export default function WaveCarouselDemo() {
  return (
    <div className="h-[640px] w-full sm:h-[800px]">
      <WaveCarousel
        items={DROPS}
        heading="Collect the next drop"
        description="Mint, trade and show off pixel art from creators onchain, with zero gas on your first claim."
      />
    </div>
  );
}
